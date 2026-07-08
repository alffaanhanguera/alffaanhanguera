import { CourseRepository } from "@/server/repositories/course-repository";
import { formatCurrency } from "@/lib/utils";

export class CourseService {
  constructor(private readonly repository = new CourseRepository()) {}

  async getN8NCatalog() {
    const courses = await this.repository.listCatalog();

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
