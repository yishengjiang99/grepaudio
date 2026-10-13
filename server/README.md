# grepaudio-rtc signaling server

Zero-dependency, in-memory WebRTC signaling for `dsp_rtc/https_rtc_client.js`.
State is lost on restart; services expire after `TTL_MS` (default 10 min) unless the host keeps polling.

## API (all JSON, body limit 64 KB)
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/rtc/:service/host` | `{localDescription, iceCandidates?}` | `{ok, service, expiresAt}` (host publishes its offer) |
| GET | `/api/rtc/list` | | `["service", ...]` |
| GET | `/api/rtc/:service/connect/` | | `{localDescription, iceCandidates}` (host's offer) |
| POST | `/api/rtc/:service/offer` | `{offer, iceCandidates:[]}` | `{id, iceCandidates}` (`offer` is the client's answer SDP) |
| GET | `/api/rtc/:service/answers?since=<id>` | | `[{id, answer, iceCandidates, at}]` (host polls) |
| DELETE | `/api/rtc/:service` | | `{ok}` |
| GET | `/api/rtc/health` | | `{ok, services}` |

Env: `PORT` (3021), `HOST` (127.0.0.1), `TTL_MS`, `MAX_BODY`, `ALLOWED_ORIGINS` (CORS, default `https://dsp.grepawk.com`).

## Run locally
    node server/server.js

## Deploy (dsp.grepawk.com)
    scp server/server.js server/package.json root@64.23.239.208:/opt/grepaudio-rtc/
    scp server/grepaudio-rtc.service root@64.23.239.208:/etc/systemd/system/
    ssh root@64.23.239.208 'id grepaudio-rtc || useradd --system --no-create-home --shell /usr/sbin/nologin grepaudio-rtc; systemctl daemon-reload; systemctl enable --now grepaudio-rtc; systemctl restart grepaudio-rtc'

nginx (inside the 443 server block of `/etc/nginx/sites-available/dsp.grepawk.com`):

    location /api/ {
        proxy_pass http://127.0.0.1:3021;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 64k;
    }
