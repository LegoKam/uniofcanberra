const Handlebars = require('handlebars');
const {
  COURSE_API_URL,
  COURSE_TEMPLATE_URL,
  fetchCourses,
  prepareBaseTemplate,
} = require('./utils');

const templateCache = {};
const PAGE_TEMPLATE = `<!DOCTYPE html>
<html>
  <head>
    {{> head }}
  </head>
  <body>
    <header></header>
    <main>
      {{> content }}
    </main>
    <footer></footer>
  </body>
</html>`;

const HEAD_PARTIAL = `<title>{{title}}</title>
<link rel="canonical" href="{{canonicalUrl}}">
<meta name="description" content="{{description}}">
<meta property="og:title" content="{{title}}">
<meta property="og:description" content="{{description}}">
<meta property="og:url" content="{{canonicalUrl}}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{title}}">
<meta name="twitter:description" content="{{description}}">
<meta name="course-code" content="{{course.code}}">
<meta name="cache-control" content="max-age=120">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Figtree:wght@400;500;600;700&family=STIX+Two+Text:wght@400;700&display=swap">
<script nonce="aem" src="/scripts/aem.js" type="module"></script>
<script nonce="aem" src="/scripts/scripts.js" type="module"></script>
<link rel="stylesheet" href="/styles/styles.css">`;

const COURSE_DETAILS_PARTIAL = `<div class="course-details">
  <div>
    <div>
      <h1>{{course.name}} ({{course.code}})</h1>
      <p>{{course.description}}</p>

      <h2>Course Snapshot</h2>
      <ul>
        <li><strong>Faculty:</strong> {{course.faculty}}</li>
        <li><strong>Study level:</strong> {{course.studyLevel}}</li>
        <li><strong>Duration:</strong> {{course.durationLabel}}</li>
        <li><strong>Credit points:</strong> {{course.creditPoints}}</li>
        <li><strong>Delivery mode:</strong> {{course.delivery}}</li>
      </ul>

      <h2>Learning outcomes</h2>
      <ol>
        {{#each course.learningOutcomeItems}}
          <li>{{this}}</li>
        {{/each}}
      </ol>

      <h2>Career pathways</h2>
      <ol>
        {{#each course.careerPathwayItems}}
          <li>{{this}}</li>
        {{/each}}
      </ol>

      {{#if course.promoVideoUrl}}
        <p><a href="{{course.promoVideoUrl}}">Watch course video</a></p>
      {{/if}}
    </div>
  </div>
</div>`;

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

async function generateCourseHtml(courseCode, options = {}) {
  registerHelpers();

  const course = await getCourseData(courseCode, options);
  const contentPartial = await compileBaseTemplate(options);

  Handlebars.registerPartial('head', HEAD_PARTIAL);
  Handlebars.registerPartial('course-details', COURSE_DETAILS_PARTIAL);
  Handlebars.registerPartial('content', contentPartial);

  const template = Handlebars.compile(PAGE_TEMPLATE);
  const title = `${course.name} (${course.code})`;

  return template({
    title,
    canonicalUrl: `${(options.siteBaseUrl || 'https://main--uniofcanberra--legokam.aem.page').replace(/\/$/, '')}/courses/${course.code.toLowerCase()}`,
    description: course.description,
    course,
  });
}

module.exports = {
  generateCourseHtml,
};
