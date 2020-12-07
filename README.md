## Run
docker run -it -d --rm --name qrcode-api -p 3000:3000 midnightcodr/qrcode-api:latest
## Examples
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


