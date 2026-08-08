# Dark Neutral Studio

A theme-only Zed extension with warm neutral light and dark variants.

## Themes

- Dark Neutral Studio Light
- Dark Neutral Studio Dark

## Local Install

1. Open Zed.
2. Run `zed: install dev extension`.
3. Select this folder.
4. Run `theme selector: toggle`.
5. Choose `Dark Neutral Studio Light` or `Dark Neutral Studio Dark`.

To let Zed follow your macOS light/dark appearance, add this to your Zed
settings:

```json
{
  "theme": {
    "mode": "system",
    "light": "Dark Neutral Studio Light",
    "dark": "Dark Neutral Studio Dark"
  }
}
```

## Troubleshooting

- If the extension does not appear after installing it as a dev extension,
  restart Zed and run `zed: reload extensions`.
- If the theme still does not appear in the selector, run `zed: open log` and
  check for extension or JSON parsing errors.
- Run `scripts/validate.sh` from this folder before sharing changes.

## Preview

Screenshots are not checked in yet. A future preview section can show both
variants once stable screenshots are available.

## Publishing

This repository is structured as a publishable Zed theme extension. Before
submitting an update, run:

```sh
scripts/validate.sh
```

## License

MIT
