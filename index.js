const express = require('express');
const app = express()
const fs = require('fs-extra');
var logger = require('tracer').dailyfile({root:'/var/log/foo/', maxLogFiles: 10, allLogsFileName: 'foo'});
var aws = require('aws-sdk');
aws.config.update({region: process.env.AWS_REGION});
var cloudwatch = new aws.CloudWatch();
const counterFile = "/usr/src/foo/counter.json";

var requestCount = {
	MetricData: [
		{
			MetricName: 'RequestsHandled',
			Dimensions: [
				{
					Name: 'RouteName',
					Value: 'Root'
				}
			],
			StorageResolution: '1',
			Timestamp: new Date().toISOString(),
			Unit: 'Count',
			Value: '1',
		}
	],
	Namespace: 'FooBar/'
}

app.get('/', (req,res)=>{
	cloudwatch.putMetricData(requestCount, (e,d)=>{if(e)logger.error("cloudwatch put metric data error: "+e)});
	incrementCounter(()=>res.sendFile(counterFile));})

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
