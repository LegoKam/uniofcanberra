const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const {
  COURSE_API_URL,
  COURSE_TEMPLATE_URL,
  fetchCourses,
  prepareBaseTemplate,
} = require('./utils');

const templateCache = {};

function registerHelpers() {
  Handlebars.registerHelper('json', (value) => JSON.stringify(value));
}

async function getCourseData(courseCode, options = {}) {
  const courses = await fetchCourses(options.courseApiUrl || COURSE_API_URL);
  const course = courses.find((item) => item.code === courseCode);
  if (!course) {
    const error = new Error(`Course ${courseCode} not found`);
    error.statusCode = 404;
    throw error;
  }
  return course;
}

async function compileBaseTemplate(options = {}) {
  const templateUrl = options.courseTemplateUrl || COURSE_TEMPLATE_URL;
  if (!templateCache[templateUrl]) {
    templateCache[templateUrl] = prepareBaseTemplate(templateUrl);
  }
  return templateCache[templateUrl];
}

function readTemplate(fileName) {
  return fs.readFileSync(path.join(__dirname, '..', 'templates', fileName), 'utf8');
}

async function generateCourseHtml(courseCode, options = {}) {
  registerHelpers();

  const course = await getCourseData(courseCode, options);
  const [pageTemplateSource, headPartial, detailsPartial, contentPartial] = await Promise.all([
    readTemplate('page.hbs'),
    readTemplate('head.hbs'),
    readTemplate('course-details.hbs'),
    compileBaseTemplate(options),
  ]);

  Handlebars.registerPartial('head', headPartial);
  Handlebars.registerPartial('course-details', detailsPartial);
  Handlebars.registerPartial('content', contentPartial);

  const template = Handlebars.compile(pageTemplateSource);
  const title = `${course.name} (${course.code})`;

  return template({
    title,
    canonicalUrl: `${(options.siteBaseUrl || 'https://main--uniofcanberra--legokam.aem.page').replace(/\/$/, '')}/courses/${course.code}`,
    description: course.description,
    course,
  });
}

module.exports = {
  generateCourseHtml,
};
