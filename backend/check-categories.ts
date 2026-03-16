import prisma from "./src/lib/prisma";

async function checkCategories() {
  try {
    console.log("\n=== CATEGORÍAS EN LA BASE DE DATOS ===\n");

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { books: true },
        },
      },
      orderBy: { name: "asc" },
    });

    console.log(`Total de categorías: ${categories.length}\n`);

    categories.forEach((cat) => {
      console.log(
        `ID: ${cat.id} | Nombre: "${cat.name}" | Libros: ${cat._count.books}`,
      );
    });

    console.log("\n=== TABLA INTERMEDIA _BookToCategory ===\n");

    const relations = await prisma.$queryRaw<
      Array<{
        book_id: number;
        title: string;
        category_id: number;
        category_name: string;
      }>
    >`
      SELECT b.id as book_id, b.title, c.id as category_id, c.name as category_name
      FROM _BookToCategory bt
      JOIN Book b ON bt.A = b.id
      JOIN Category c ON bt.B = c.id
      ORDER BY b.id
      LIMIT 20
    `;

    console.log(`Total de relaciones (primeras 20): ${relations.length}\n`);

    relations.forEach((rel) => {
      console.log(
        `Libro "${rel.title}" (ID: ${rel.book_id}) -> Categoría "${rel.category_name}" (ID: ${rel.category_id})`,
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
