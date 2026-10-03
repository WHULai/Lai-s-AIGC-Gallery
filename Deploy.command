#!/bin/zsh -l

if ! command -v npm >/dev/null 2>&1 && [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  source "$HOME/.nvm/nvm.sh"
fi

if cd -- "${0:A:h}"; then
  printf '\nPublishing Lai’s AIGC Gallery to Cloudflare Pages…\n\n'
  npm run deploy
  deployment_status=$?
else
  printf '\nCould not open the project folder.\n' >&2
  deployment_status=1
fi

if (( deployment_status == 0 )); then
  printf '\nDeployment succeeded: https://lai-s-aigc-gallery.pages.dev\n'
else
  printf '\nDeployment failed (exit code %s). Read the error above, then retry.\n' "$deployment_status" >&2
fi

if [[ -t 0 && -t 1 ]]; then
  read -r 'deployment_reply?Press Enter to close this window…'
fi
exit "$deployment_status"
