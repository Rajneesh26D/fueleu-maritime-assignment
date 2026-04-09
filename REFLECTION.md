# Reflection

Working on the Fuel EU Maritime assignment alongside AI tools turned out to be a good fit for how I like to build things: clear boundaries first, then iterate fast. I tended to steer the big picture—what had to be true for compliance math, how the API should behave, and how the dashboard should feel—and used agents to speed up the mechanical parts: folder structure, boilerplate endpoints, and UI scaffolding. That left more of my time for the parts that actually decide quality: checking formulas against the spec, walking through edge cases, and making sure the React tabs matched what the backend promised.

I got comfortable treating the workflow as a collaboration rather than a one-shot generation. I reviewed diffs, ran builds and tests when something looked off, and pushed back when an output didn’t match the domain rules. Keeping TypeScript strict and the hexagonal split meant feedback was concrete—either the compiler or the tests would complain, which made it easier to stay aligned without endless manual clicking.

What I take away is that the value isn’t in replacing thinking; it’s in compressing the repetitive cycles so I can focus on judgment—naming, structure, and verifying that the app behaves correctly for someone using the Routes, Compare, Banking, and Pooling flows. I’m happy with how that balance worked on this project.
