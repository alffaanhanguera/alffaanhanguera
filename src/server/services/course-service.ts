import { CourseRepository } from "@/server/repositories/course-repository";
import { formatCurrency } from "@/lib/utils";

export class CourseService {
  constructor(private readonly repository = new CourseRepository()) {}

  async getN8NCatalog() {
    const courses = await this.repository.listCatalog();

    if (!courses.length) {
      return [
        {
          id: "mock-course-1",
          name: "Administracao",
          price: formatCurrency(109),
          description: "Bacharelado com oferta EAD 100% Online e avaliacoes presenciais agendadas.",
          status: "Ativo"
        },
        {
          id: "mock-course-2",
          name: "Pedagogia",
          price: formatCurrency(99),
          description: "Licenciatura com flexibilidade de horario e campanha comercial ativa.",
          status: "Ativo"
        },
        {
          id: "mock-course-3",
          name: "Analise e Desenvolvimento de Sistemas",
          price: formatCurrency(129),
          description: "Tecnologo com alta demanda comercial e oferta automatica habilitada.",
          status: "Ativo"
        }
      ];
    }

    return courses.map((course) => ({
      id: course.id,
      name: course.name,
      price: formatCurrency(Number(course.offers[0]?.monthlyPrice ?? 0)),
      description:
        course.offers[0]?.notes ??
        `${course.type} com ${course.durationSemesters} semestres e modalidades comerciais configuradas.`,
      status: "Ativo"
    }));
  }
}
