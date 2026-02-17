import db from '../db';

interface PackageData {
  name: string;
  description?: string;
  price: number;
}

const Package = {
  findAll: async () => {
    const packages = await db('test_packages').select('*').orderBy('name');

    // For each package, fetch its included tests
    const packagesWithTests = await Promise.all(
      packages.map(async (pkg: any) => {
        const tests = await db('test_package_items')
          .join('tests', 'test_package_items.test_id', 'tests.id')
          .where('test_package_items.package_id', pkg.id)
          .select('tests.id', 'tests.name', 'tests.price');
        return { ...pkg, tests };
      })
    );

    return packagesWithTests;
  },

  findById: async (id: number) => {
    const pkg = await db('test_packages').where({ id }).first();
    if (!pkg) return null;

    const tests = await db('test_package_items')
      .join('tests', 'test_package_items.test_id', 'tests.id')
      .where('test_package_items.package_id', id)
      .select('tests.id', 'tests.name', 'tests.price');

    return { ...pkg, tests };
  },

  create: async (data: PackageData, testIds: number[]) => {
    return db.transaction(async (trx) => {
      const [newPackage] = await trx('test_packages')
        .insert(data)
        .returning('*');

      if (testIds.length > 0) {
        const items = testIds.map((testId) => ({
          package_id: newPackage.id,
          test_id: testId,
        }));
        await trx('test_package_items').insert(items);
      }

      return newPackage;
    });
  },

  update: async (id: number, data: Partial<PackageData>, testIds?: number[]) => {
    return db.transaction(async (trx) => {
      const [updatedPackage] = await trx('test_packages')
        .where({ id })
        .update(data)
        .returning('*');

      if (testIds !== undefined) {
        // Remove old associations and re-insert
        await trx('test_package_items').where({ package_id: id }).del();
        if (testIds.length > 0) {
          const items = testIds.map((testId) => ({
            package_id: id,
            test_id: testId,
          }));
          await trx('test_package_items').insert(items);
        }
      }

      return updatedPackage;
    });
  },

  delete: (id: number) => {
    return db('test_packages').where({ id }).del();
  },
};

export default Package;
