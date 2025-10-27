import OpenAI from "openai";
import 'dotenv/config'
import fs from "fs/promises"
import { exec } from "child_process";

const openai = new OpenAI();

async function getWeatherData(city){
    return `The weather of ${city} is 33 C`
}
async function createFolder(path){
    try {
        await fs.mkdir(path, { recursive: true });
        return `Successfully created folder: ${path}`;
    } catch (error) {
        return `Error creating folder: ${error.message}`;
    }
}


async function runCommand(command){
    return new Promise((resolve, reject)=>{
        exec(command, (error, stdout, stderr)=>{
            if(error){
                resolve(`Error: ${error.code}: ${error.message}`)
            } else {
                resolve(`stdout: ${stdout}`)
            }
        })
    })
}


const availableFunctions = {
    createFolder:{
        functionName: 'createFolder',
        fn: createFolder,
        description: 'Takes path as string and create a folder at the path',
    },
    runCommand: {
        functionName: 'runCommand',
        fn: runCommand,
        description: 'Takes command as string and execute the command on users machine and return the output',
    },
    getWeatherData:{
        functionName: 'getWeatherData',
        fn: getWeatherData,
        description: 'Takes city as string  an input and return the weather data of the city',
    }
}

const SYSTEM_PROMPT = `
You are helpfull assisgntent speciallized in resolving user query

you work on start, plan, action, obeserve mode.
for the given user query and available tool, plan the step by step execution, based on the planning,
select the relevant tool from the available tool, and based on the tool selection you perform an action wait for the observation and based on the observation from the tool vall resolve the user query.

Rules: 
- Follow the output JSON Format.
- Always perform one step at a time and wait for next input
- caregully analyse the uer query

Output JSON format: 
{
"step" : "string",
"content" : "string",
"tool" : "The name of the function if the step is action",
"input" : "The input parameter for the function"
}

Available Tools:
${Object.values(availableFunctions).map(({functionName, description}) => `${functionName}: ${description}`).join('\n')}

Example:
User query : what is the weather of new york?
output: {"step":"plan", "content":"The user is interested in weather data of new york"}
output: {"step":"plan", "content":"From the available tools I should call getWeather function"}
output: {"step":"action", "tool":"getWeatherData", "input":"new york"}
output: {"step":"observe", "output":"12 Degree Cel" }
output: {"step":"output", "content":"The weather data of new york seems to be 12 Degrees"}
`;

const messageDB = [];

messageDB.push({role: 'system', content: SYSTEM_PROMPT})

// const query = 'create a file named weather.txt and write the weather data of new york  and pune in it';
const query = 'create todo folder and inside that folder make a fully working todo list app using html, css and javascript';

messageDB.push({role: 'user', content: query})

startAgent();
async function startAgent(){
    while (true) {
        let result;
        try {
            result = await openai.chat.completions.create({
                model: 'gpt-4.1',
                response_format: {type: 'json_object'},
                messages: messageDB
            });
        } catch (error) {
            console.log(`❌ OpenAI API Error: ${error.message}`);
            break;
        }
        const response = result.choices[0].message.content;
        messageDB.push({role: 'assistant', content: response})
    
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(response);
        } catch (error) {
            console.log(`❌ Error parsing JSON: ${error.message}`);
            console.log(`Response was: ${response}`);
            messageDB.push({role: 'developer', content: `Invalid JSON response: ${response}`});
            continue;
        }
    
        const {step} = parsedResponse;
    
        if(step == "plan"){
            console.log(`🧠: ${parsedResponse.content}`)
            continue;
        }
        if(step === "action"){

            const {tool, input} = parsedResponse;

            const mapping = availableFunctions[tool];

            if(!mapping){
                messageDB.push({role: 'developer', content: `unsupported toop ${tool}`})
                continue;
            }

            console.log(`⚓: calling ${tool} with input ${input}`)

            const output = await mapping.fn(input);

            console.log(`⚓: ${tool}: ${input} \t=> ${output}`)
            
            messageDB.push({
                role: 'developer',
                content: JSON.stringify({step: 'observe', output: output})
            })
            continue;
        }
        if(step  === "output"){
            console.log(`🤖 : ${parsedResponse.content}`)
            break; 
        }
    }


}


// (async ()=>{

//     const result  = await openai.chat.completions.create({
//         model: 'gpt-4.1',
//         messages: [{
//             role: 'system',
//             content: SYSTEM_PROMPT
//         },
//             {
//             role: 'user',
//             content: 'what is the weather of pune?' // this is the user message
//             }
//     ]
//     })

//     console.log(`🤖 : ${result.choices[0].message.content}`)

// })()



// console.log(`output = ${response.output_text}`)