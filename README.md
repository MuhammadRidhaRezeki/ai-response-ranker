# AI Response Ranker

A single-page browser tool for **AI trainers, data annotators, and RLHF reviewers** who compare two model responses to the same prompt and have to produce a defensible verdict — fast, consistently, and in a format that can be pasted straight into a task report.

You paste the prompt and the two responses, score each one from 1–5 on the four criteria that show up in almost every evaluation rubric, pick a winner, write your rationale, and export the whole evaluation as Markdown or JSON.

**No backend. No build step. No sign-up. No data leaves your browser.**

## Who it's for

- AI trainers on platforms like Outlier, Scale AI, Alignerr, and similar, doing side-by-side (SxS) response ranking.
- Annotators who must justify a preference with per-criterion scores, not just a gut feeling.
- Anyone building small evaluation datasets who wants timestamped, structured verdicts.

## Features

- **Prompt + two responses** in one view, with the two responses scored side by side.
- **Four criteria, scored 1–5 each**, for both responses:
  - **Accuracy** — facts are correct, no hallucinations
  - **Completeness** — covers everything the prompt asks
  - **Clarity** — easy to read, well structured
  - **Instruction following** — format, length, tone, and constraints obeyed
- **Live weighted totals** (equal weights) with a visual bar and a "Leading" highlight on the card currently ahead.
- **Verdict picker** (A wins / Tie / B wins) that is pre-selected from the totals but can always be overridden — the export records whether the winner was automatic or a manual pick, and if your pick disagrees with the totals the page tells you.
- **Rationale field** for the "why" behind the verdict.
- **Export as Markdown or JSON** — copy to clipboard or download a timestamped file containing the prompt, both responses, every score, both totals, the winner, and the rationale.
- **Load sample** fills in a complete example evaluation (a "why is the sky blue" prompt where one response is accurate and one repeats the ocean-reflection myth) so you can see the workflow end to end.
- **Fully offline** — open `index.html` and it works, even with no connection.

## How to use

1. Paste the **prompt** both models were given.
2. Paste **Response A** and **Response B**.
3. Drag the four sliders for each response (1 = poor, 5 = excellent).
4. Check the totals, confirm or override the **winner**, and write your **rationale**.
5. **Copy or download** the verdict as Markdown (for reports and docs) or JSON (for datasets and tooling).

## Run it locally

Just open `index.html` in any modern browser. There is nothing to install and nothing to build.

## Host it on GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.
4. After a minute, your tool is live at `https://<your-username>.github.io/<repo-name>/`.

## Screenshot

<!-- Replace this section with a real screenshot: open index.html, load the sample, and capture the page. -->
*Screenshot placeholder — load the built-in sample and drop your capture here.*

## Project structure

```
ai-response-ranker/
├── index.html   # Page structure: prompt, responses, verdict, export
├── styles.css   # All styling (no frameworks)
├── app.js       # Scoring, verdict suggestion, Markdown/JSON export
├── README.md
└── LICENSE      # MIT
```

## License

MIT — see [LICENSE](LICENSE). Copyright © Muhammad Ridha Rezeki.
