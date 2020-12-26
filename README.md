## Run
docker run -it -d --rm --name qrcode-api -p 3000:3000 midnightcoder/qrcode-api:latest
## Encode into qrcode
1. Getting qrcode (outpunt in png format)
```
curl  http://localhost:3000/t2q?info=hello+world > /tmp/out.png
```

2. Decode qrcode
```
curl -F 'upfile=@/tmp/out.png' http://localhost:3000/q2t
# output 
# {"info":"hello world","width":400,"height":400}
```

## Links
- [Docker hub image](https://hub.docker.com/repository/docker/midnightcoder/qrcode-api)
- [Link to this repo on github](https://github.com/midnightcodr/qrcode-api-docker)
