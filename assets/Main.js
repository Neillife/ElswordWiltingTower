let currentModule = null;
const modeSelect = document.querySelector('#selectMode');

async function loadMode(modeName) {
  if (currentModule) currentModule.abort();

  currentModule = new AbortController();
  const { signal } = currentModule;

  const module = await import(`./${modeName}.js`);
  if (module.init) module.init(signal);
}

document.body.addEventListener('change', async (e) => {
    if (e.target && e.target.id === 'selectMode') {
        loadMode(e.target.value);
    }
});

loadMode(modeSelect.value);
