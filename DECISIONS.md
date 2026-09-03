This file is entirely written by me (Beak-man). I had inputs from LLMs to draft it, but nothing was copied and pasted. This is entirely my writing and paraphrasing.

## AI setup and workflow

I used an adversarial code review workflow between Gemini Pro 3.1 and Claude Fable 5. No MCP connection, I manually transfered outputs and inputs between both models. My reasoning for this setup is as follows:
- LLMs have become incredibly good at choosing and implementing math, but their capacity to visually validate interactive 3D graphics is still limited. All their assumptions stem from the math and unit tests, but their capacity for functional tests is still limited (more on this in the last section). This is where I step in and why I keep the process manual until frontier models catch up for interactive 3D apps.
- The usage of models from two different families decreases the potential for hallucination biases. Both models can be wrong, but when that happens, they're usually wrong in different ways, making it easier for a human coder to detect hallucinations and biases.
- Why Gemini Pro 3.1 if it is relatively low-powered compared to Fable 5? Cost optimization. Gemini is low-priced and while it's not as nearly as capable as the frontier models (like Fable 5 and GPT-5.6 Sol), it's more than enough for prompt-engineering and investigating larger architectural decisions, leaving the frontier model in my setup (Fable 5) to do the heavy math and coding work. Gemini does have one technical advantage: A larger context window than models from Anthropic or Open AI.
- The full chat with Gemini for this project can be seen here: https://share.gemini.google/GqbeMazXNyoK

## What was delegated to AI

- Building upon the provided scene boilerplate, the geometry setup and core spatial tracking loop were delegated to Fable 5. I assumed the potential for LLM hallucinations in the nested matrix math arising from the parent -> child relationships between the objects (platform -> turret base -> turret head). With the intention to mitigate LLM hallucinations, the prompt forced the use of native Three.js local-space conversions (worldToLocal) and quaternion speed capping (rotateTowards). Gemini suggested avoiding the usage of Three.js interpolation facilities ([lerp](https://threejs.org/docs/?q=lerp#global.lerp) and [slerp](https://threejs.org/docs/#Quaternion.slerp)) to enforce strict linear constant speed caps (90 deg/s). I was still expecting the math to be wrong, but the constraints worked to prevent LLM spatial math hallucinations. It immediately produced a deliverable product. Did this mean this was a one-shot done deal that took less than 20 minutes? Not quite.

## What was hand-coded

- I manually replaced a deprecated API, handled the GitHub Actions deployment configuration to publish the app at https://beak-man.github.io/threejs-interview-miguel/, and injected intentional math breakages to validate the AI's logic with rigor under time constraints.

## Where the AI led astray and how I caught it

- I injected math breakages in the rotations and tracking while validating the results both visually and via console logs. Fable 5 made wrong assumptions when I asked it how to validate the correctness of its work. Still, Fable overengineered the project enough to make it partially resistant to my initial breakages (e.g. I made the turret to track the drone less effectively, but it never snapped or stuck to a position indefinitely as Fable predicted). I correctly identified both its wrong assumptions (as can be seen in [full_chat_transcript.md](https://github.com/Beak-man/threejs-interview-miguel/blob/main/full_chat_transcript.md) and why my initial breakages were not enough to reproduce the behavior expected by Fable. The AI failed to realize that its own rate-limited actuator (`rotateTowards`) entirely masked the mathematical spike of the broken target state.

- I manually introduced modifications that broke the specification (e.g. allowing the turret base to surpass a rotation of 90 deg/s and increasing its tracking speed to allow perfect tracking). These are commented out in the final code.

- I identified an easy to solve, but critical error: Fable used a deprecated [THREE.Clock](https://threejs.org/docs/?q=clock#Clock) object, causing a console warning (a spec violation). I consulted Three.js' documentation, confirmed the deprecation, asked Fable to confirm if this was a training bias error, and manually switched it for the current [THREE.Timer](https://threejs.org/docs/?q=timer#Timer) object.

## Proposed next steps with more time and token budget

- Refactor the monolithic render loop into modules like `TurretController` or `DroneFlightPath`.
- Implement an automated WebGL visual testing regime by using headless browsers. This can capture canvas frame sequences that the LLM can then visually inspect. I consider this an overkill for this test, but I've successfully used this setup to partially automate visual functional testing. It's not a perfect solution: the LLM can still make wrong inferences from screenshots and miss critical information between them. It also costs a lot of tokens. Worthwhile to do it for more complex projects (I did this with GRAZE).

## Tokens spent
- $3.62 in Claude's usage credits. Potentially zero had I used Opus 5 instead of Fable 5.
- $0 in Gemini's usage credits (usage fell within my current Google One subscription)
