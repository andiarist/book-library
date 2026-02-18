import prisma from "./src/lib/prisma";

/**
 * Script para normalizar categorías que fueron guardadas como strings concatenados
 * Ejemplo: "Novela, Intriga, Policial" -> ["Novela", "Intriga", "Policial"]
 */
async function fixCategories() {
  try {
    console.log("\n=== INICIANDO NORMALIZACIÓN DE CATEGORÍAS ===\n");

    // 1. Buscar categorías que contengan comas (están concatenadas)
    const problematicCategories = await prisma.category.findMany({
      where: {
        name: {
          contains: ",",
        },
      },
      include: {
        books: true,
      },
    });

    console.log(
      `✓ Encontradas ${problematicCategories.length} categorías con problemas:\n`,
    );

    for (const category of problematicCategories) {
      console.log(`  - ID ${category.id}: "${category.name}"`);
      console.log(`    Libros afectados: ${category.books.length}`);
    }

    if (problematicCategories.length === 0) {
      console.log("\n✅ No hay categorías con problemas. Todo está bien!");
      return;
    }

    console.log("\n=== PROCESANDO CORRECCIONES ===\n");

    for (const problematicCategory of problematicCategories) {
      console.log(`\n📝 Procesando: "${problematicCategory.name}"`);

      // Separar el nombre concatenado en categorías individuales
      const individualCategories = problematicCategory.name
        .split(",")
        .map((cat) => cat.trim())
        .filter((cat) => cat.length > 0);

      console.log(
        `   → Se dividirá en: ${individualCategories.map((c) => `"${c}"`).join(", ")}`,
      );

      // Para cada libro que tiene esta categoría problemática
      for (const book of problematicCategory.books) {
        console.log(`   → Actualizando libro: "${book.title}"`);

        await prisma.$transaction(async (tx) => {
          // 1. Desconectar la categoría problemática
          await tx.book.update({
            where: { id: book.id },
            data: {
              categories: {
                disconnect: { id: problematicCategory.id },
              },
            },
          });

          // 2. Conectar o crear las categorías individuales
          await tx.book.update({
            where: { id: book.id },
            data: {
              categories: {
                connectOrCreate: individualCategories.map((name) => ({
                  where: { name },
                  create: { name },
                })),
              },
            },
          });
        });

        console.log(`      ✓ Libro actualizado correctamente`);
      }

      // 3. Eliminar la categoría problemática si ya no tiene libros
      const remainingBooks = await prisma.category.findUnique({
        where: { id: problematicCategory.id },
        include: { _count: { select: { books: true } } },
      });

      if (remainingBooks && remainingBooks._count.books === 0) {
        await prisma.category.delete({
          where: { id: problematicCategory.id },
        });
        console.log(
          `   ✓ Categoría problemática eliminada: "${problematicCategory.name}"`,
        );
      }
    }

    console.log("\n=== VERIFICANDO RESULTADOS ===\n");

    const allCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: { books: true },
        },
      },
      orderBy: { name: "asc" },
    });

    console.log(
      `Total de categorías después de la limpieza: ${allCategories.length}\n`,
    );

    const stillProblematic = allCategories.filter((cat) =>
      cat.name.includes(","),
    );

    if (stillProblematic.length > 0) {
      console.log(
        "⚠️ Aún quedan categorías con comas (puede que tengan libros asignados):",
      );
      stillProblematic.forEach((cat) => {
        console.log(`   - "${cat.name}" (${cat._count.books} libros)`);
      });
    } else {
      console.log(
        "✅ ¡Todas las categorías han sido normalizadas correctamente!",
      );
    }

    console.log("\nCategorías finales:");
    allCategories.forEach((cat) => {
      console.log(`   - "${cat.name}" (${cat._count.books} libros)`);
    });

    console.log("\n=== PROCESO COMPLETADO ===\n");
  } catch (error) {
    console.error("❌ Error durante la normalización:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCategories();
