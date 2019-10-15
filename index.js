const express = require('express');
const app = express()
const fs = require('fs-extra');
var logger = require('tracer').dailyfile({root:'/var/log/foo/', maxLogFiles: 10, allLogsFileName: 'foo'});
const counterFile = "/usr/src/foo/counter.json";

app.get('/', (req,res)=>{incrementCounter(()=>res.sendFile(counterFile))})
app.listen(80, ()=>console.log("Running at 80"))

async function incrementCounter(cb){
	try{
		fs.pathExists(counterFile) 
		.then(exists =>{
			if (exists){
				fs.readJson(counterFile)
				.then(counterObj=>{
					fs.writeJson(counterFile, {count: parseInt(counterObj.count)+1})
					.then(()=>cb())
					.catch(e=>logger.error("counterFile increment error: "+e));
				})
				.catch(e=>logger.error("counterFile read error: "+e));
			}else{
				fs.writeJson(counterFile, {count: 1})
				.catch(e=>logger.error("counterFile write error: "+e));
			}
		})
		.catch(e => {
			logger.error("counterFile error: "+e);
		})
		
	}
	catch(e){
		logger.error("incrementCounter exception: "+e);
	}
}
