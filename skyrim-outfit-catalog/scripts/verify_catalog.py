"""Verify an existing snapshot and the offline UI in an isolated headless browser."""
from pathlib import Path
import base64
import json
import subprocess
import time
import urllib.request
import websocket

ROOT = Path(__file__).resolve().parents[1]
TEST = ROOT / 'verification'
TEST.mkdir(exist_ok=True)


class Browser:
    def __init__(self, socket):
        self.socket = socket
        self.sequence = 0
        self.errors = []

    def call(self, method, params=None):
        self.sequence += 1
        self.socket.send(json.dumps({'id': self.sequence, 'method': method, 'params': params or {}}))
        while True:
            result = json.loads(self.socket.recv())
            if result.get('method') == 'Runtime.exceptionThrown':
                self.errors.append(result['params'])
            if result.get('id') == self.sequence:
                if 'error' in result:
                    raise RuntimeError(result['error'])
                return result.get('result', {})

    def evaluate(self, expression):
        result = self.call('Runtime.evaluate', {'expression': expression, 'returnByValue': True})
        if 'exceptionDetails' in result:
            raise RuntimeError(result['exceptionDetails'])
        return result['result'].get('value')


def wait_for(predicate, timeout=20):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        result = predicate()
        if result:
            return result
        time.sleep(.1)
    raise TimeoutError('Browser UI did not become ready')


def set_filter(browser, name, value):
    selector = json.dumps('[data-filter="' + name + '"]')
    property_name = 'checked' if isinstance(value, bool) else 'value'
    return browser.evaluate(f'(() => {{ const node=document.querySelector({selector}); node.{property_name}={json.dumps(value)}; node.dispatchEvent(new Event("input",{{bubbles:true}})); return document.querySelector("[data-role=result-count]").textContent; }})()')


def verify(browser):
    report = {}
    wait_for(lambda: browser.evaluate('document.querySelectorAll(".outfit-card").length') > 0)
    report['default'] = browser.evaluate('document.querySelector("[data-role=result-count]").textContent')
    assert browser.evaluate('document.querySelectorAll(".outfit-card").length') == 36
    report['search'] = set_filter(browser, 'search', 'Master Thief')
    assert browser.evaluate('document.querySelectorAll(".outfit-card").length') > 0
    assert browser.evaluate('[...document.querySelectorAll(".outfit-card h3")].every(node=>node.textContent.includes("Master Thief"))')
    browser.evaluate('document.querySelector(".item-details").open=true')
    wait_for(lambda: browser.evaluate('document.querySelectorAll(".item").length') > 0)
    report['detail_item'] = browser.evaluate('document.querySelector(".item-name").textContent')
    assert browser.evaluate('document.querySelector(".command").dataset.command.startsWith("help ")')
    browser.evaluate('document.querySelector(".favorite").click()')
    assert browser.evaluate('document.querySelector(".favorite").getAttribute("aria-pressed")') == 'true'
    report['favorites'] = set_filter(browser, 'favorites', True)
    assert browser.evaluate('document.querySelectorAll(".outfit-card").length') == 1
    browser.evaluate('document.querySelector("[data-action=reset]").click()')
    report['shieldmaiden'] = set_filter(browser, 'role', 'Krieger / Schildmaid')
    report['heavy'] = set_filter(browser, 'type', 'Schwer')
    assert browser.evaluate('document.querySelectorAll(".outfit-card").length') > 0
    browser.evaluate('document.querySelector(".item-details").open=true')
    wait_for(lambda: browser.evaluate('document.querySelectorAll(".item").length') > 0)
    assert browser.evaluate('[...document.querySelectorAll(".item-meta:first-of-type")].every(node=>node.textContent.startsWith("Schwer"))')
    browser.evaluate('document.querySelector("[data-action=reset]").click()')
    report['thieves_guild'] = set_filter(browser, 'guild', 'Diebesgilde')
    assert browser.evaluate('document.querySelectorAll(".outfit-card").length') > 0
    browser.evaluate('document.querySelector("[data-action=reset]").click()')
    report['new'] = set_filter(browser, 'new', True)
    assert browser.evaluate('[...document.querySelectorAll(".pack-label")].every(node=>node.textContent.startsWith("NEU"))')
    report['empty'] = set_filter(browser, 'search', '__no_such_outfit_20261006__')
    assert browser.evaluate('document.querySelector("[data-role=empty]").hidden') is False
    browser.evaluate('document.querySelector("[data-action=reset]").click()')
    report['with_base'] = set_filter(browser, 'base', True)
    snapshot = json.loads((ROOT / 'data/catalog.json').read_text(encoding='utf-8'))
    assert str(snapshot['meta']['items']).replace(',', '') in report['with_base'].replace('.', '')
    set_filter(browser, 'base', False)
    browser.evaluate('document.querySelector("[data-action=more]").click()')
    assert browser.evaluate('document.querySelectorAll(".outfit-card").length') == 72
    report['visual_search'] = set_filter(browser, 'visual', 'Redone')
    assert browser.evaluate('document.querySelectorAll(".visual-pack").length') > 0
    browser.evaluate('document.querySelector("[data-action=reset]").click()')
    browser.call('Emulation.setDeviceMetricsOverride', {'width': 1360, 'height': 1050, 'deviceScaleFactor': 1, 'mobile': False})
    screenshot = browser.call('Page.captureScreenshot', {'format': 'png', 'captureBeyondViewport': False})
    (TEST / 'desktop.png').write_bytes(base64.b64decode(screenshot['data']))
    browser.call('Emulation.setDeviceMetricsOverride', {'width': 390, 'height': 844, 'deviceScaleFactor': 1, 'mobile': True})
    report['mobile_no_horizontal_overflow'] = browser.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert report['mobile_no_horizontal_overflow']
    assert not browser.errors, browser.errors
    report['javascript_errors'] = browser.errors
    return report


def main():
    data = json.loads((ROOT / 'data/catalog.json').read_text(encoding='utf-8'))
    ids = [item['id'] for collection in data['collections'] for item in collection['items']]
    assert len(ids) == len(set(ids)) == data['meta']['items']
    assert len(data['collections']) == data['meta']['collections']
    assert data['meta']['unresolved_names'] == 0
    assert not any('naked' in item['editor'].casefold() for collection in data['collections'] for item in collection['items'])
    chrome = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
    profile = TEST / ('browser-profile-' + str(int(time.time())))
    args = [chrome, '--headless=new', '--disable-gpu', '--no-first-run', '--disable-extensions',
            '--remote-debugging-port=9228', '--remote-debugging-address=127.0.0.1',
            '--user-data-dir=' + str(profile), '--window-size=1360,1050', (ROOT / 'index.html').as_uri()]
    with (TEST / 'browser.log').open('w', encoding='utf-8') as log:
        process = subprocess.Popen(args, stdout=log, stderr=log, creationflags=subprocess.CREATE_NO_WINDOW)
        browser = None
        try:
            def tabs():
                try:
                    return json.load(urllib.request.urlopen('http://127.0.0.1:9228/json/list', timeout=1))
                except (OSError, ValueError):
                    return None
            targets = wait_for(tabs)
            target = next(tab for tab in targets if tab['type'] == 'page')
            browser = Browser(websocket.create_connection(target['webSocketDebuggerUrl'], suppress_origin=True, timeout=20))
            browser.call('Runtime.enable')
            browser.call('Page.enable')
            report = verify(browser)
            (TEST / 'results.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
            print(json.dumps(report, ensure_ascii=False, indent=2))
        finally:
            if browser:
                try:
                    browser.call('Browser.close')
                except (OSError, websocket.WebSocketException):
                    pass
                browser.socket.close()
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.terminate()


if __name__ == '__main__':
    main()
