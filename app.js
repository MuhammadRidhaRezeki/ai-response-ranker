(function () {
  "use strict";

  var CRITERIA = [
    { key: "accuracy", label: "Accuracy" },
    { key: "completeness", label: "Completeness" },
    { key: "clarity", label: "Clarity" },
    { key: "instruction", label: "Instruction following" }
  ];
  var SIDES = ["a", "b"];

  var winnerTouched = false; // true once the trainer picks a winner manually

  function el(id) { return document.getElementById(id); }

  function slider(side, criterion) {
    return document.querySelector(
      'input[type="range"][data-side="' + side + '"][data-criterion="' + criterion + '"]'
    );
  }

  function getScores(side) {
    var scores = {};
    CRITERIA.forEach(function (c) { scores[c.key] = parseInt(slider(side, c.key).value, 10); });
    return scores;
  }

  function totalOf(scores) {
    var sum = 0;
    CRITERIA.forEach(function (c) { sum += scores[c.key]; });
    return sum / CRITERIA.length; // equal weights
  }

  function suggestedWinner(totalA, totalB) {
    var a = Math.round(totalA * 100) / 100;
    var b = Math.round(totalB * 100) / 100;
    if (a > b) return "A";
    if (b > a) return "B";
    return "Tie";
  }

  function selectedWinner() {
    var checked = document.querySelector('input[name="winner"]:checked');
    return checked ? checked.value : "Tie";
  }

  function setWinner(value) {
    var radio = document.querySelector('input[name="winner"][value="' + value + '"]');
    if (radio) radio.checked = true;
  }

  function winnerText(value) {
    if (value === "A") return "Response A";
    if (value === "B") return "Response B";
    return "Tie";
  }

  function refresh() {
    var totals = {};
    SIDES.forEach(function (side) {
      var scores = getScores(side);
      var t = totalOf(scores);
      totals[side] = t;
      var upper = side.toUpperCase();
      CRITERIA.forEach(function (c) {
        el(side + "-" + c.key + "-val").textContent = scores[c.key];
      });
      el("total" + upper).textContent = t.toFixed(2) + " / 5";
      el("bar" + upper).style.width = (t / 5 * 100) + "%";
    });

    var suggestion = suggestedWinner(totals.a, totals.b);
    if (!winnerTouched) setWinner(suggestion);

    // Leading card highlight + pill
    el("cardA").classList.toggle("leading", suggestion === "A");
    el("cardB").classList.toggle("leading", suggestion === "B");
    el("leadA").hidden = suggestion !== "A";
    el("leadB").hidden = suggestion !== "B";

    var hint = el("winnerHint");
    if (winnerTouched && selectedWinner() !== suggestion) {
      hint.textContent = "Totals suggest " + winnerText(suggestion) +
        ", but your manual pick (" + winnerText(selectedWinner()) + ") is what gets exported.";
    } else if (winnerTouched) {
      hint.textContent = "Your manual pick matches the totals. It stays fixed even if the scores change.";
    } else {
      hint.textContent = "The winner is pre-selected from the totals — you can always override it.";
    }
  }

  function collect() {
    var scoresA = getScores("a");
    var scoresB = getScores("b");
    return {
      tool: "AI Response Ranker",
      exported_at: new Date().toISOString(),
      prompt: el("promptInput").value.trim(),
      responses: {
        A: { text: el("respA").value.trim(), scores: scoresA, total: round2(totalOf(scoresA)) },
        B: { text: el("respB").value.trim(), scores: scoresB, total: round2(totalOf(scoresB)) }
      },
      winner: selectedWinner(),
      winner_source: winnerTouched ? "manual" : "auto (highest total)",
      rationale: el("rationaleInput").value.trim()
    };
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  function scoreRows(resp) {
    return CRITERIA.map(function (c) {
      return "| " + c.label + " | " + resp.scores[c.key] + " / 5 |";
    }).join("\n");
  }

  function toMarkdown(d) {
    var lines = [];
    lines.push("# AI Response Evaluation");
    lines.push("");
    lines.push("- **Exported:** " + d.exported_at);
    lines.push("- **Winner:** " + winnerText(d.winner) + " (" + d.winner_source + ")");
    lines.push("");
    lines.push("## Prompt");
    lines.push("");
    lines.push(d.prompt || "_(not provided)_");
    lines.push("");
    lines.push("## Response A — total " + d.responses.A.total.toFixed(2) + " / 5");
    lines.push("");
    lines.push(d.responses.A.text || "_(empty)_");
    lines.push("");
    lines.push("| Criterion | Score |");
    lines.push("| --- | --- |");
    lines.push(scoreRows(d.responses.A));
    lines.push("");
    lines.push("## Response B — total " + d.responses.B.total.toFixed(2) + " / 5");
    lines.push("");
    lines.push(d.responses.B.text || "_(empty)_");
    lines.push("");
    lines.push("| Criterion | Score |");
    lines.push("| --- | --- |");
    lines.push(scoreRows(d.responses.B));
    lines.push("");
    lines.push("## Rationale");
    lines.push("");
    lines.push(d.rationale || "_(not provided)_");
    lines.push("");
    return lines.join("\n");
  }

  function showToast(message) {
    var toast = el("toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  function copyText(text, message) {
    function done() { showToast(message); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* clipboard unavailable */ }
    document.body.removeChild(ta);
  }

  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime + ";charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  }

  function stamp() {
    return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  }

  var SAMPLE = {
    prompt: "Explain why the sky is blue to a 10-year-old, in at most three sentences.",
    a: "Sunlight looks white, but it is really made of many colors. When sunlight reaches the air around Earth, the blue part gets scattered in every direction by tiny air particles — much more than the other colors. So wherever you look, scattered blue light reaches your eyes, and the sky looks blue.",
    b: "The sky is blue because it reflects the color of the ocean, which covers most of the Earth. Long ago, people believed the sky was a giant dome made of blue glass. The color also changes because of pollution and the seasons. Blue light travels the farthest of all colors, which is why distant mountains look blue too. That is why the sky appears blue during the day.",
    scoresA: { accuracy: 5, completeness: 4, clarity: 5, instruction: 5 },
    scoresB: { accuracy: 2, completeness: 4, clarity: 3, instruction: 2 },
    rationale: "A is accurate (Rayleigh scattering, explained at a child's level), stays within the three-sentence limit, and reads clearly. B contains a factual error — the sky does not reflect the ocean; if anything the causality runs the other way — and it runs to five sentences, breaking the explicit constraint. B covers the topic broadly, but accuracy and instruction following decide this one."
  };

  function loadSample() {
    el("promptInput").value = SAMPLE.prompt;
    el("respA").value = SAMPLE.a;
    el("respB").value = SAMPLE.b;
    CRITERIA.forEach(function (c) {
      slider("a", c.key).value = SAMPLE.scoresA[c.key];
      slider("b", c.key).value = SAMPLE.scoresB[c.key];
    });
    el("rationaleInput").value = SAMPLE.rationale;
    winnerTouched = false;
    refresh();
    showToast("Sample evaluation loaded");
  }

  function clearAll() {
    el("promptInput").value = "";
    el("respA").value = "";
    el("respB").value = "";
    el("rationaleInput").value = "";
    SIDES.forEach(function (side) {
      CRITERIA.forEach(function (c) { slider(side, c.key).value = 3; });
    });
    winnerTouched = false;
    refresh();
    showToast("Cleared");
  }

  // Events
  document.querySelectorAll('input[type="range"]').forEach(function (input) {
    input.addEventListener("input", refresh);
  });
  document.querySelectorAll('input[name="winner"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      winnerTouched = true;
      refresh();
    });
  });
  el("sampleBtn").addEventListener("click", loadSample);
  el("clearBtn").addEventListener("click", clearAll);
  el("copyMdBtn").addEventListener("click", function () {
    copyText(toMarkdown(collect()), "Markdown copied to clipboard");
  });
  el("dlMdBtn").addEventListener("click", function () {
    download("evaluation-" + stamp() + ".md", toMarkdown(collect()), "text/markdown");
    showToast("Markdown downloaded");
  });
  el("copyJsonBtn").addEventListener("click", function () {
    copyText(JSON.stringify(collect(), null, 2), "JSON copied to clipboard");
  });
  el("dlJsonBtn").addEventListener("click", function () {
    download("evaluation-" + stamp() + ".json", JSON.stringify(collect(), null, 2), "application/json");
    showToast("JSON downloaded");
  });

  refresh();
})();
