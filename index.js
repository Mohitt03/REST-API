// const http = require('http')

// const myServer = http.createServer((req, res) => {
//     // console.log(req);
//     // res.end(req.headers)
//     res.writeHead(200, { 'Content-Type': 'application/json' })
//     res.end(JSON.stringify(req.headers, null, 2))
// })

// myServer.listen(8000, () => console.log("Server is running on port 8000"))


const crypto = require('crypto')

const token = crypto.randomBytes(25).toString('hex')
console.log(token);

const password = crypto.createHash('shake256').update('stpi90@Mohit2005').digest('hex')
const password2 = crypto.createHash('shake256').update('stpi90@Mohit2005').digest('hex')
console.log(crypto.randomBytes(16).toString('hex'));

