/* Shared helpers: content loading and saved preferences. */
(function () {
  "use strict";

  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* private mode: ignore */ } }
  };

  async function fetchText(url) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status + " " + url);
    return res.text();
  }

  async function fetchJSON(url) {
    return JSON.parse(await fetchText(url));
  }

  function loadSyllabus() {
    return fetchJSON("content/syllabus.json");
  }

  // Topics in the teacher's order ("mock" number), then by syllabus area.
  function publishedTopics(syllabus) {
    const areaOrder = syllabus.areas.map((a) => a.id);
    return syllabus.topics
      .filter((t) => t.status === "published")
      .sort((a, b) => (a.mock || 99) - (b.mock || 99) || areaOrder.indexOf(a.area) - areaOrder.indexOf(b.area));
  }

  // All past paper questions, each with its paper info attached.
  async function loadQuestions() {
    const index = await fetchJSON("content/papers/index.json");
    const papers = await Promise.all(index.papers.map((f) => fetchJSON("content/papers/" + f)));
    return papers.flatMap((p) => p.questions.map((q) => Object.assign({ paper: p.paper }, q)));
  }

  function fileError(err) {
    const local = location.protocol === "file:";
    return '<p class="empty-state">Could not load this content.' +
      (local ? " Open the site with <code>preview.command</code> (a local server) instead of double-clicking the HTML file." : "") +
      "</p>";
  }

  window.App = { store, fetchText, fetchJSON, loadSyllabus, publishedTopics, loadQuestions, fileError };
})();
