# Prompt Log

All prompts given to the AI assistant (Claude Code), in order, unedited.

## Prompt 1

```
You are assisting me with a WebGL take-home challenge using Three.js (0.185.1). We must be accurate and cost-efficient. The 60-minute time budget is a soft target; prioritize correct implementation over strict time limits.

Execute this in 4 sequential steps. Commit your work to Git after EACH step using the prefix "[ai] " for the commit message.

STEP 1: Prompt Logging Setup
- Initialize a `PROMPTS.md` file in the root directory. Log this initial prompt and all subsequent prompts there, unedited.

STEP 2: Scene & Animation Loop
- Replace the starter cube with a circular platform (CylinderGeometry) rotating continuously on the Y-axis.
- Add a drone (a simple Mesh) flying a fast, continuous 3D parametric path (e.g., using `Math.sin`/`cos` and time) above and around the platform.
- Add OrbitControls to the camera, updating in the render loop.

STEP 3: Turret Construction
- Create a Turret Base (rotates on Y) mounted near the edge of the rotating platform. It MUST be a child of the platform so it rotates with it.
- Create a Turret Head (pitches up/down) as a child of the Turret Base.

STEP 4: Tracking Math (CRITICAL)
Implement the tracking logic in the render loop. You must strictly adhere to these constraints:
1. The turret tracks the drone's world position. Because the turret is mounted on a moving parent, you MUST calculate the target rotations by converting the drone's world position into the relevant local spaces (`worldToLocal`).
2. The Turret Head cannot pitch below horizontal.
3. The turret's rotation speed is capped at 90 degrees/second. Do NOT use `lerp` or time-based `slerp` to fake this. You MUST calculate the exact target Quaternions for both the Base and the Head, and strictly enforce the speed limit using `Quaternion.rotateTowards(targetQuat, (Math.PI / 2) * delta)`.
4. Make the drone fly fast enough to easily trigger this 90 deg/sec cap, proving the lag-and-catch-up behavior works smoothly without snapping.

Stop when done. Output a concise summary of your implementation and print the exact code block you wrote for the turret tracking logic inside the render loop.
```

## Prompt 2

```
Configure this project for deployment to GitHub Pages using GitHub Actions. 
Execute these 2 steps:
1. Update `vite.config.ts` (create it if it doesn't exist) to set the `base` path to `/threejs-interview-miguel/`.
2. Create a standard GitHub Actions workflow file at `.github/workflows/deploy.yml` that builds the project using `npm run build` and deploys the `dist` folder to GitHub Pages.

Do not run tests or attempt to commit and push to remote. Just write the files and output a brief confirmation.
```

## Prompt 3

```
I am reviewing the turret tracking logic you generated. Do NOT edit any code in your response; I only want an explanation and validation steps.

I commented out the `turretBase.updateMatrixWorld(true);` line right before the head pitch calculation, and the app behaves exactly the same. 

My hypothesis: Because the base only yaws on the Y-axis, the local horizontal distance (`Math.hypot(x, z)`) and local `y` height remain constant regardless of the yaw matrix state. Therefore, that mid-tick matrix update is mathematically redundant for the pitch calculation in this specific rig.

Confirm if this hypothesis is correct. Then, give me specific, step-by-step instructions on how to manually validate your math in my editor. I want to know exactly what lines to temporarily alter or log to visually and numerically prove:
1. Why `Math.hypot(targetLocal.x, targetLocal.z)` is strictly necessary instead of just using `targetLocal.z`.
2. What happens to the tracking math when the base yaw hits the 90 deg/sec cap and lags behind the drone.
```


