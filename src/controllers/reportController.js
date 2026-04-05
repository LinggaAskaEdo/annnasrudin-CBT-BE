class ReportController {
  constructor(reportService) {
    this.reportService = reportService;
  }

  /**
   * Generates a JSON report for all siswa results in a specific exam schedule.
   */
  getClassroomReport = async (req, res, next) => {
    const { scheduleId } = req.params;

    try {
      const reportData = await this.reportService.getClassroomReport(scheduleId);

      res.json({
        status: 'success',
        data: reportData
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ReportController;
