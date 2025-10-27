# vector emeddings and chunking

chunking is the process of deviding or splitting up resources or data which we feed to the LLM. chunking is mainly used for reason that we can't feed entire resource or piece of data to LLM because context window limit that's why we can use chunking.

for example let's a take chat with pdf project.

Whole process : 
1. we have pdf as resource.
2. we do the chunking, (split pdf data in multiple part) and in our vector database we do the vector emeddings of it.
3. We take the question of user regrading that pdf  and do the vector emedding of that also. // This part called reterival

* Above process is called indexing. And it's done only one time for one resource.

