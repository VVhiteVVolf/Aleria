// Shared HTTP transport. Credentials live only in this closure and are never
// part of a workspace, transfer package or persisted preference.
export const encodeGitHubPath=path=>path.split('/').map(encodeURIComponent).join('/');

export function createGitHubRepositoryClient({token,repository,fetchRef=globalThis.fetch}) {
  if(!/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(repository))throw new Error('Repository bitte als Benutzer/Repository eintragen.');
  if(typeof token!=='string'||!token.trim())throw new Error('Bitte einen GitHub-Zugriffstoken eintragen.');
  const base=`https://api.github.com/repos/${repository}`;
  return async function request(path,{method='GET',body,allow404=false}={}) {
    let response;
    try {
      response=await fetchRef(`${base}${path}`,{
        method,
        headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token.trim()}`,'X-GitHub-Api-Version':'2026-03-10',...(body?{'Content-Type':'application/json'}:{})},
        ...(body?{body:JSON.stringify(body)}:{}),
        signal:AbortSignal.timeout(30000),cache:'no-store',credentials:'omit',redirect:'error'
      });
    }catch{throw new Error('GitHub ist gerade nicht erreichbar. Deine lokale Arbeit ist weiterhin vorhanden.');}
    if(response.status===404&&allow404)return null;
    if(!response.ok){
      const messages={401:'Der GitHub-Token ist ungültig oder abgelaufen.',403:'Kein Schreibzugriff. Der Token benötigt für dieses Repository „Contents: Read and write“.',404:'Repository oder Speicherbranch nicht gefunden. Bitte Ziel und Token-Berechtigungen prüfen.',409:'Das Repository ist leer oder wurde gleichzeitig verändert. Bitte mit einer README initialisieren bzw. das Ziel erneut prüfen.',422:'Der Speicherbranch wurde gleichzeitig verändert oder ist geschützt. Bitte das Ziel erneut prüfen.',429:'GitHub begrenzt gerade die Anfragen. Bitte später erneut speichern.'};
      const error=new Error(messages[response.status]||`GitHub-Anfrage fehlgeschlagen (HTTP ${response.status}).`);
      error.status=response.status;throw error;
    }
    return response.json();
  };
}
