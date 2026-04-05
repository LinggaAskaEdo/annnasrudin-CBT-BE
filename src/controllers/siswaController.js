class SiswaController {
  constructor(siswaService) {
    this.siswaService = siswaService;
  }

  updateProfile = async (req, res, next) => {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ status: 'error', message: 'Password is required' });
    }

    try {
      await this.siswaService.updateProfile(req.user.id, password);
      res.json({ status: 'success', message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  getAvailableModules = async (req, res, next) => {
    try {
      const modules = await this.siswaService.getAvailableModules(req.user.id);
      res.json({ status: 'success', data: modules });
    } catch (error) {
      next(error);
    }
  };

  getAvailableExams = async (req, res, next) => {
    try {
      const exams = await this.siswaService.getAvailableExams(req.user.id);
      res.json({ status: 'success', data: exams });
    } catch (error) {
      next(error);
    }
  };

  getResults = async (req, res, next) => {
    try {
      const results = await this.siswaService.getResults(req.user.id);
      res.json({ status: 'success', data: results });
    } catch (error) {
      next(error);
    }
  };

  getResultDetail = async (req, res, next) => {
    const { hasilUjianId } = req.params;

    try {
      const result = await this.siswaService.getResultDetail(hasilUjianId, req.user.id);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };
}

export default SiswaController;
