"""Read legacy territory articles as data; never carry their HTML layout forward."""
import re
from bs4 import BeautifulSoup

def plain(node):
    return re.sub(r'\s+([,.;:!?])', r'\1', re.sub(r'\s+', ' ', node.get_text(' ', strip=True))).strip()


def block_text(node):
    """Read a paragraph/list item's own text, leaving nested blocks to their turn."""
    parts = [str(text).strip() for text in node.find_all(string=True)
             if text.find_parent(['p', 'li']) is node and str(text).strip()]
    return re.sub(r'\s+([,.;:!?])', r'\1', re.sub(r'\s+', ' ', ' '.join(parts))).strip()

def meaningful(value):
    return bool(re.sub(r'[\s.\-?…–—]', '', value or ''))

def direct_rows(table):
    return (table.find('tbody', recursive=False) or table).find_all('tr', recursive=False)

def extract_article(path):
    soup = BeautifulSoup(path.read_text(encoding='utf-8-sig'), 'html.parser')
    copy = {k: [] for k in ['overview','history','culture','economy','defense','banditry','geography','flora','trivia']}
    keys = {'1':'overview','2':'history','3':'culture','5.b':'economy','5.c':'defense','5.d':'banditry',
            '7.a':'geography','8.a':'Flora','8.b':'Fauna','8.c':'Bedrohliche Tiere','8.d':'Unnatürliche Kreaturen','9':'trivia'}
    section = None; flora = {}
    for para in soup.find_all(['p','li']):
        if len(para.find_parents('table')) != 1:
            continue
        value=block_text(para);heading=re.match(r'^(\d+)(?:\.([a-z]))?\.?\)\s',value)
        if heading:
            section=keys.get(heading[1]+('.'+heading[2] if heading[2] else ''))
        elif section and meaningful(value):
            (copy[section] if section in copy else flora.setdefault(section,[])).append(value)
    infobox=[];group=None
    for row in direct_rows(soup.find_all('table')[2]):
        values=[plain(c) for c in row.find_all(['td','th'],recursive=False)]
        if len(values)==1:
            group={'title':values[0],'rows':[]} if values[0] in ['Allgemein','Geographie','Kultur','Handel'] else None
            if group:infobox.append(group)
        elif len(values)==2 and group and meaningful(values[1]):
            group['rows'].append({'label':values[0],'value':values[1].rstrip(',')})
    council=[]
    for table in soup.find_all('table'):
        rows=direct_rows(table)
        if not rows or not re.fullmatch(r'Rat des (Jarls|Thanen|Hesiren)',plain(rows[0])):continue
        for i,row in enumerate(rows):
            offices=[plain(c) for c in row.find_all(['td','th'],recursive=False)]
            lead=i==2 and len(offices)==1 and offices[0] in ['Jarl','Thane','Hesir']
            if not lead and not (len(offices)==5 and any('des ' in o for o in offices)):continue
            pics=rows[i+1].find_all(['td','th'],recursive=False);names=rows[i+2].find_all(['td','th'],recursive=False)
            cols=[next((j for j,c in enumerate(names) if meaningful(plain(c))),len(names)//2)] if lead else range(len(offices))
            members=[]
            for j in cols:
                office=offices[0] if lead else offices[j]
                if not office:continue
                members.append({'office':office,'name':plain(names[j]),'imageSrc':pics[j].img.get('src','') if pics[j].img else '',**({'featured':True} if lead else {})})
            council.append({'title':'Herrschaft' if lead else 'Ratsämter' if 'Kriegsherr' in offices[0] else 'Geistliche und beratende Ämter','members':members})
    return {'copy':copy,'floraSections':[{'title':k,'paragraphs':v} for k,v in flora.items()], 'infobox':infobox,'councilGroups':council}
