# ChatGPT Button Pet Extension

This directory contains a minimal Chrome-compatible extension that injects a small pet above the ChatGPT send button.

## Load it locally

1. Open your Chromium-based browser extension page.
2. Enable developer mode.
3. Choose `Load unpacked`.
4. Select this folder:
   - `/Users/zbw/Documents/New project/extension`

## Current behavior

- Finds the active ChatGPT composer form
- Locates the send button using multiple heuristics
- Pins a small pet above that button
- Repositions on layout changes, scrolling, and composer rerenders
- Clicking the pet triggers a small hop animation

## Notes

- This does not modify ChatGPT itself; it overlays a local extension UI on top of the page.
- The button selector is heuristic-based because the ChatGPT DOM can change over time.
