import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Company } from '../../modules/companies/entities/company.entity';

export default class CompanySeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const companyRepo = dataSource.getRepository(Company);

    const companies = [
      { name: 'Socobuses S.A.', nit: '800.123.456-1', address: 'Av. Kevin Ángel', phone: '8850000' },
      { name: 'Sideral S.A.', nit: '800.654.321-2', address: 'Calle 20 #22-27', phone: '8840000' },
      { name: 'Cable Aéreo Manizales', nit: '900.111.222-3', address: 'Estación Fundadores', phone: '8730000' },
    ];

    for (const cData of companies) {
      const existing = await companyRepo.findOneBy({ nit: cData.nit });
      if (!existing) {
        console.log(`🌱 Creating Company: ${cData.name}`);
        const company = companyRepo.create(cData);
        await companyRepo.save(company);
      }
    }
  }
}
