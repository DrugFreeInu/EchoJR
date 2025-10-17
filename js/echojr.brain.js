// echojr.brain.js
// Echo Jr's logic layer — the brain that listens, remembers, and responds.
// All actions are sandboxed, read-only, and trigger background signals.

(function(){
  console.log("Echo Jr Brain Online 🧠");

  // internal memory
  const state = {
    owner: null,
    repo: null,
    selectedFile: localStorage.getItem("echojr-selected-file") || null,
    lastFileContent: null
  };

  // safe getters
  window.echojr = {
    getSelectedFile: () => state.selectedFile,
    getRepo: () => state.repo,
    getOwner: () => state.owner,
    readCachedFile: () => state.lastFileContent,
    setContext: ({ owner, repo }) => {
      state.owner = owner;
      state.repo = repo;
      console.log("Echo Jr context set:", owner, "/", repo);
    }
  };

  // file selected → remember + broadcast
  window.addEventListener("echojrFileSelected", e => {
    state.selectedFile = e.detail;
    localStorage.setItem("echojr-selected-file", state.selectedFile);
    console.log("Echo Jr brain: file selected →", state.selectedFile);
    backgroundFetch();
  });

  // actions → observe and log
  window.addEventListener("echojrAction", e => {
    const action = e.detail;
    console.log("Echo Jr brain: received action →", action);
    // Placeholder for future logic
  });

  // fetch + cache file contents if context known
  async function backgroundFetch(){
    if(!state.owner || !state.repo || !state.selectedFile){
      console.warn("Echo Jr: missing context, skipping fetch");
      return;
    }
    try{
      const url = `https://api.github.com/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(state.repo)}/contents/${encodeURIComponent(state.selectedFile)}`;
      const res = await fetch(url);
      if(!res.ok) throw new Error("GitHub fetch failed");
      const data = await res.json();
      if(!data.content){
        console.warn("Echo Jr: no file content returned");
        return;
      }
      const raw = atob(data.content.replace(/\n/g,""));
      state.lastFileContent = raw;
      console.log(`Echo Jr cached "${state.selectedFile}" (${raw.length} chars)`);
      window.dispatchEvent(new CustomEvent("echojrFileCached", { detail: { file: state.selectedFile, size: raw.length } }));
    }catch(err){
      console.error("Echo Jr fetch error:", err.message);
    }
  }

})();
