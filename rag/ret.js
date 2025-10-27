import 'dotenv/config'
import { OpenAIEmbeddings } from '@langchain/openai'
import { QdrantVectorStore } from '@langchain/qdrant';
import OpenAI from 'openai';

const client = new OpenAI();

async function chat(question = ''){

    const embeddings = new OpenAIEmbeddings({
        model: 'text-embedding-3-small'
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
            url: 'http://localhost:6333',
            collectionName: 'langchainjs-demo'
        }
    );

    const ret  = vectorStore.asRetriever({k: 3});

    const result = await ret.invoke(question);

    const SYSTEM_PROMPT = `You are a helpfull AI assistant who answeres the user query based on the available conetxt from PDF file.
    context: 
    ${JSON.stringify(result)}
    `;


    const chatResult = await client.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
            {role: 'system', content: SYSTEM_PROMPT},
            {role: 'user', content: question}
        ]
    })

    console.log(`🤖 : ${chatResult.choices[0].message.content}`) 
}


chat('can you explain me about web servers and which page number should i refer to know more about it?')