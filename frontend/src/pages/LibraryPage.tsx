import { BookCardMini } from '@/components/cards/BookCardMini';
import { useBooks } from '@/hooks/useBooks';

const LibraryPage = () => {
  const { data: books, isLoading, isError } = useBooks();

  if (isLoading) {
    return <div>Cargando libros...</div>;
  }

  if (isError) {
    return <div>Error al cargar los libros</div>;
  }
  if (books === undefined || books.length === 0) {
    return (
      <p className="p-8 text-center text-gray-500 italic">
        Aún no has añadido ningún libro. Busca por ISBN o texto para empezar.
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-lg">Mi biblioteca ({books.length})</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
        {books.map((book) => (
          <div key={book.id} className="h-full">
            <BookCardMini book={book} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryPage;
