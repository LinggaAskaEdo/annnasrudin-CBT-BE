import prisma from './config/prisma.js';

// Repositories
import UserRepository from './repositories/userRepository.js';
import HasilUjianRepository from './repositories/hasilUjianRepository.js';
import JadwalUjianRepository from './repositories/jadwalUjianRepository.js';
import MataPelajaranRepository from './repositories/mataPelajaranRepository.js';
import ModulRepository from './repositories/modulRepository.js';
import UjianRepository from './repositories/ujianRepository.js';
import RombelRepository from './repositories/rombelRepository.js';
import SoalRepository from './repositories/soalRepository.js';

// Services
import AuthService from './services/authService.js';
import UserService from './services/userService.js';
import ExamService from './services/examService.js';
import ExamSessionService from './services/examSessionService.js';
import GuruService from './services/guruService.js';
import ModuleService from './services/moduleService.js';
import ReportService from './services/reportService.js';
import RombelService from './services/rombelService.js';
import ScheduleService from './services/scheduleService.js';
import SiswaService from './services/siswaService.js';

// Controllers
import AuthController from './controllers/authController.js';
import AdminController from './controllers/adminController.js';
import ExamController from './controllers/examController.js';
import ExamSessionController from './controllers/examSessionController.js';
import GuruController from './controllers/guruController.js';
import ModuleController from './controllers/moduleController.js';
import ReportController from './controllers/reportController.js';
import ScheduleController from './controllers/scheduleController.js';
import SiswaController from './controllers/siswaController.js';

// Middlewares
import AuthMiddleware from './middlewares/authMiddleware.js';

// Instantiate Repositories
const userRepository = new UserRepository(prisma);
const hasilUjianRepository = new HasilUjianRepository(prisma);
const jadwalUjianRepository = new JadwalUjianRepository(prisma);
const mataPelajaranRepository = new MataPelajaranRepository(prisma);
const modulRepository = new ModulRepository(prisma);
const ujianRepository = new UjianRepository(prisma);
const rombelRepository = new RombelRepository(prisma);
const soalRepository = new SoalRepository(prisma);

// Instantiate Services
const authService = new AuthService(userRepository);
const userService = new UserService(userRepository);
const examService = new ExamService(ujianRepository, soalRepository);
const examSessionService = new ExamSessionService(hasilUjianRepository, jadwalUjianRepository);
const guruService = new GuruService(userRepository, hasilUjianRepository);
const moduleService = new ModuleService(modulRepository);
const reportService = new ReportService(hasilUjianRepository, jadwalUjianRepository);
const rombelService = new RombelService(rombelRepository);
const scheduleService = new ScheduleService(jadwalUjianRepository, ujianRepository);
const siswaService = new SiswaService(userRepository, modulRepository, jadwalUjianRepository, hasilUjianRepository);

// Instantiate Controllers
const authController = new AuthController(authService);
const adminController = new AdminController(userService, rombelService);
const examController = new ExamController(examService);
const examSessionController = new ExamSessionController(examSessionService);
const guruController = new GuruController(guruService);
const moduleController = new ModuleController(moduleService);
const reportController = new ReportController(reportService);
const scheduleController = new ScheduleController(scheduleService);
const siswaController = new SiswaController(siswaService);

// Instantiate Middlewares
const authMiddleware = new AuthMiddleware(userRepository);

export {
  authController,
  adminController,
  examController,
  examSessionController,
  guruController,
  moduleController,
  reportController,
  scheduleController,
  siswaController,
  authMiddleware
};
