import axios from 'axios';

export const searchGoogleBooks = async (isbn: string) => {
  const res = await axios.get(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
  );

  if (!res.data.items?.length) return null;

  const info = res.data.items[0].volumeInfo;

  return {
    title: info.title,
    authors: info.authors || [],
    categories: info.categories || [],
    publisher: info.publisher,
    publishYear: info.publishedDate
      ? parseInt(info.publishedDate.substring(0, 4))
      : null,
    imageUrl: info.imageLinks?.thumbnail,
  };
};

export const searchOpenLibrary = async (isbn: string) => {
  const res = await axios.get(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
  );

  const book = res.data[`ISBN:${isbn}`];
  if (!book) return null;

  return {
    title: book.title,
    authors: book.authors?.map((a: any) => a.name) || [],
    categories: book.subjects?.slice(0, 5).map((s: any) => s.name) || [],
    publisher: book.publishers?.[0]?.name,
    publishYear: book.publish_date
      ? parseInt(book.publish_date.match(/\d{4}/)?.[0] || '')
      : null,
    imageUrl: book.cover?.large || book.cover?.medium,
  };
};

export const searchGoogleBooksByText = async (query: string) => {
  const res = await axios.get(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`,
  );

  if (!res.data.items?.length) return [];

  return res.data.items.map((item: any) => {
    const info = item.volumeInfo;
    return {
      title: info.title,
      authors: info.authors || [],
      categories: info.categories || [],
      publisher: info.publisher,
      publishYear: info.publishedDate
        ? parseInt(info.publishedDate.substring(0, 4))
        : null,
      imageUrl: info.imageLinks?.thumbnail,
    };
  });
};

export const searchOpenLibraryByText = async (query: string) => {
  const res = await axios.get(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`,
  );

  if (!res.data.docs?.length) return [];

  return res.data.docs.slice(0, 10).map((doc: any) => ({
    title: doc.title,
    authors: doc.author_name || [],
    categories: doc.subject?.slice(0, 5) || [],
    publisher: doc.publisher?.[0],
    publishYear: doc.first_publish_year || null,
    imageUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null,
  }));
};
