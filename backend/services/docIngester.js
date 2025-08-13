const axios = require('axios');
const ragService = require('./ragService');

class DocIngester {
  constructor() {
    this.githubApi = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Ragtime-DocIngester',
      },
    });
  }

  async fetchLangChainDocs() {
    try {
      console.log('🌐 Fetching LangChain documentation from GitHub...');

      // Fetch the main docs directory
      const docsResponse = await this.githubApi.get(
        '/repos/langchain-ai/langchain/contents/docs'
      );

      const mdxFiles = [];
      
      // Recursively find all .mdx files
      await this.findMdxFiles(docsResponse.data, mdxFiles);

      console.log(`📚 Found ${mdxFiles.length} MDX files`);

      let totalChunks = 0;
      const results = [];

      for (const file of mdxFiles) {
        try {
          console.log(`📄 Processing: ${file.path}`);
          
          const content = await this.fetchFileContent(file.download_url);
          const metadata = {
            fileName: file.name,
            filePath: file.path,
            source: 'langchain-docs',
            githubUrl: file.html_url,
            size: file.size,
          };

          const result = await ragService.ingestDocument(content, metadata);
          totalChunks += result.chunksCount;
          results.push({
            file: file.path,
            ...result,
          });

          // Small delay to be respectful to GitHub API
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Error processing ${file.path}:`, error.message);
          results.push({
            file: file.path,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        filesProcessed: mdxFiles.length,
        totalChunks,
        results,
      };
    } catch (error) {
      console.error('❌ Error fetching LangChain docs:', error);
      throw error;
    }
  }

  async findMdxFiles(items, mdxFiles) {
    for (const item of items) {
      if (item.type === 'file' && item.name.endsWith('.mdx')) {
        mdxFiles.push(item);
      } else if (item.type === 'dir') {
        try {
          const dirResponse = await this.githubApi.get(item.url);
          await this.findMdxFiles(dirResponse.data, mdxFiles);
        } catch (error) {
          console.warn(`⚠️ Could not access directory ${item.path}:`, error.message);
        }
      }
    }
  }

  async fetchFileContent(downloadUrl) {
    try {
      const response = await axios.get(downloadUrl);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch file content: ${error.message}`);
    }
  }

  async ingestFromUrl(url, metadata = {}) {
    try {
      console.log(`🌐 Fetching content from: ${url}`);
      
      const response = await axios.get(url);
      const content = response.data;

      const result = await ragService.ingestDocument(content, {
        ...metadata,
        source: 'url',
        url,
        fetchTimestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      console.error('❌ Error ingesting from URL:', error);
      throw error;
    }
  }

  async ingestFromText(text, metadata = {}) {
    try {
      console.log('📝 Ingesting text content...');
      
      const result = await ragService.ingestDocument(text, {
        ...metadata,
        source: 'text',
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      console.error('❌ Error ingesting text:', error);
      throw error;
    }
  }
}

module.exports = new DocIngester();
