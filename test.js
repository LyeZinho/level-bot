import { DanbooruClient } from "danbooru-sdk";

const client = new DanbooruClient(
    {
        baseUrl: "https://testbooru.donmai.us/",
        userAgent: "MyDanbooruApp/1.0 (by username on danbooru)",
    }
);


/*
// Buscar páginas wiki
const pages = await danbooru.wikiPages.search('touhou', 20);

// Listar páginas wiki
const pages = await danbooru.wikiPages.list({
  search: {
    title: 'tag_name',
  },
  limit: 50,
});

// Criar página wiki
const newPage = await danbooru.wikiPages.create({
  wiki_page: {
    title: 'tag_name',
    body: 'Wiki content here',
  },
});
*/

async function fetchRandomSafeImage(tag) {
    try {
        const posts = await client.posts.search({
            tags: `${tag} rating:safe`,
            limit: 100,
            random: true,
        });

        if (posts.length === 0) {
            console.log("No images found for the given tag.");
            return null;
        }

        const randomIndex = Math.floor(Math.random() * posts.length);
        const selectedPost = posts[randomIndex];

        return selectedPost.file_url;
    } catch (error) {
        console.error("Error fetching image from Danbooru:", error);
        return null;
    }
}


// Exemplo de uso
fetchRandomSafeImage("touhou").then((imageUrl) => {
    if (imageUrl) {
        console.log("Random Safe Image URL:", imageUrl);
    } else {
        console.log("Failed to fetch image.");
    }
});
