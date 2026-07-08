const DEFAULT_API = 'https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnSay4Xe-pjISF73XwDlALajDy3HyBaDPmMgMtrv9SBzyiVOPAr_I3gfJUK34Cdit9qI-ry-HxnsO0lgWdl9iV2Zorq9_jFY6Ge4xuGJey5U2Hzf4RKs6IDCCBWLkJh_QKp1_hLSm8TUyqUHTB2e8XSboRRgHGziIDxJbvnjq2Qlolj5N21rtReIsVdnY2zvjjglK_lP2I1EyWnQArb57aJopRivV8Si8MsRubiGTXJwy35obswdKYT3sEbCI-8J5ttZs60Q42-3vegJhde6Ma5vmR89ig&lib=McI758pGcVz3y2ie2K0qCakWpqKg1bUk2';

function getCourseCodeFromPath() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  const coursesIndex = segments.indexOf('courses');
  if (coursesIndex === -1) return '';

  const code = segments[coursesIndex + 1];
  if (!code || code === 'default') return '';
  return code.toUpperCase();
}

function getStudyLevel(courseName = '') {
  const name = courseName.toLowerCase();
  if (name.includes('master') || name.includes('graduate certificate') || name.includes('graduate diploma')) {
    return 'Graduate';
  }
  if (name.includes('bachelor') || name.includes('diploma')) {
    return 'Undergraduate';
  }
  return 'Other';
}

function getCreditPoints(duration = '') {
  const match = duration.match(/(\d+)\s*Credit Points/i);
  return match ? match[1] : '—';
}

function getDuration(duration = '') {
  const match = duration.match(/^([^/]+)/);
  return match ? match[1].trim() : duration || '—';
}

function parseList(text = '') {
  if (!text) return [];

  const cleaned = text
    .replace(/^Students will (?:be able to:|demonstrate ability to:|develop skills to:|develop ability to:|develop capacity to:|be capable of:|be equipped to:)\s*/i, '')
    .replace(/^Graduates will (?:be able to:|demonstrate ability to:)\s*/i, '')
    .replace(/^Upon completion,?\s*(?:students will be able to:|graduates will)\s*/i, '')
    .replace(/^Career outcomes include\s*/i, '')
    .replace(/^Career pathways include\s*/i, '')
    .replace(/^Graduates pursue careers as\s*/i, '')
    .replace(/^Graduates work as\s*/i, '')
    .replace(/^Graduates enter careers as\s*/i, '');

  return cleaned
    .split(/;(?=\s*[a-z])/)
    .map((item) => item.trim().replace(/\.$/, ''))
    .filter(Boolean);
}

function normalizeCourse(raw) {
  return {
    code: raw['Course Code'] || '',
    name: raw['Course Name'] || '',
    faculty: raw.Faculty || '',
    description: raw['Course Description'] || '',
    learningOutcomes: raw['Learning Outcomes'] || '',
    careerPathways: raw['Career Pathways'] || '',
    duration: raw['Duration & Credit Points'] || '',
    delivery: raw['Delivery Mode'] || '',
    heroImage: raw['Hero Image URL'] || '',
    promoVideo: raw['Promo Video URL'] || '',
    studyLevel: getStudyLevel(raw['Course Name']),
    creditPoints: getCreditPoints(raw['Duration & Credit Points'] || ''),
    durationLabel: getDuration(raw['Duration & Credit Points'] || ''),
  };
}

function getApiUrl(block) {
  const link = block.querySelector('a[href]');
  if (link?.href && !link.href.endsWith('#')) return link.href;
  return DEFAULT_API;
}

function buildMetaItem(label, value, link) {
  const item = document.createElement('div');
  item.className = 'course-details-meta-item';

  const dt = document.createElement('dt');
  dt.textContent = label;

  const dd = document.createElement('dd');
  if (link) {
    const anchor = document.createElement('a');
    anchor.href = link;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = value;
    dd.append(anchor);
  } else {
    dd.textContent = value;
  }

  item.append(dt, dd);
  return item;
}

function buildList(items) {
  const list = document.createElement('ol');
  list.className = 'course-details-list';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.append(li);
  });
  return list;
}

function buildAccordion(id, title, content, expanded = false) {
  const section = document.createElement('section');
  section.className = 'course-details-accordion';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'course-details-accordion-trigger';
  button.id = `${id}-trigger`;
  button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  button.setAttribute('aria-controls', `${id}-panel`);
  button.innerHTML = `<span>${title}</span><span class="course-details-chevron" aria-hidden="true"></span>`;

  const panel = document.createElement('div');
  panel.className = 'course-details-accordion-panel';
  panel.id = `${id}-panel`;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', `${id}-trigger`);
  panel.hidden = !expanded;
  panel.append(content);

  button.addEventListener('click', () => {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    panel.hidden = isExpanded;
  });

  section.append(button, panel);
  return section;
}

function renderCourse(block, course) {
  const root = document.createElement('div');
  root.className = 'course-details-inner';

  const hero = document.createElement('header');
  hero.className = 'course-details-hero';
  if (course.heroImage) {
    hero.style.backgroundImage = `linear-gradient(rgb(0 61 76 / 82%), rgb(0 61 76 / 82%)), url("${course.heroImage}")`;
  }

  const heroInner = document.createElement('div');
  heroInner.className = 'course-details-hero-inner';

  const title = document.createElement('h1');
  title.textContent = `${course.name} (${course.code})`;

  const note = document.createElement('p');
  note.textContent = 'Please note these are the current details for this course.';

  heroInner.append(title, note);
  hero.append(heroInner);

  const breadcrumb = document.createElement('nav');
  breadcrumb.className = 'course-details-breadcrumb';
  breadcrumb.setAttribute('aria-label', 'Breadcrumb');

  const homeLink = document.createElement('a');
  homeLink.href = '/';
  homeLink.textContent = 'Home';

  const searchLink = document.createElement('a');
  searchLink.href = '/courses/default';
  searchLink.textContent = 'Find your course';

  const current = document.createElement('span');
  current.textContent = course.name;

  breadcrumb.append(
    homeLink,
    document.createTextNode(' / '),
    searchLink,
    document.createTextNode(' / '),
    current,
  );

  const meta = document.createElement('dl');
  meta.className = 'course-details-meta';
  meta.append(
    buildMetaItem('Delivery mode', course.delivery),
    buildMetaItem('Credit points', course.creditPoints),
    buildMetaItem('Study level', course.studyLevel),
    buildMetaItem('Duration', course.durationLabel),
    buildMetaItem('Faculty', course.faculty),
    buildMetaItem('Location', 'Bruce, Canberra'),
    buildMetaItem(
      'Promo video',
      course.promoVideo ? 'Watch course video' : '—',
      course.promoVideo || null,
    ),
  );

  const introContent = document.createElement('div');
  introContent.className = 'course-details-section-content';
  const introParagraph = document.createElement('p');
  introParagraph.textContent = course.description;
  introContent.append(introParagraph);

  const outcomes = parseList(course.learningOutcomes);
  const outcomesContent = document.createElement('div');
  outcomesContent.className = 'course-details-section-content';
  if (outcomes.length) {
    const heading = document.createElement('h3');
    heading.textContent = 'Learning outcomes';
    outcomesContent.append(heading, buildList(outcomes));
  } else {
    const paragraph = document.createElement('p');
    paragraph.textContent = course.learningOutcomes || 'Learning outcomes are not available.';
    outcomesContent.append(paragraph);
  }

  const careers = parseList(course.careerPathways);
  const careersContent = document.createElement('div');
  careersContent.className = 'course-details-section-content';
  if (careers.length) {
    const heading = document.createElement('h3');
    heading.textContent = 'Career pathways';
    careersContent.append(heading, buildList(careers));
  } else {
    const paragraph = document.createElement('p');
    paragraph.textContent = course.careerPathways || 'Career pathway information is not available.';
    careersContent.append(paragraph);
  }

  const requirementsContent = document.createElement('dl');
  requirementsContent.className = 'course-details-requirements';
  requirementsContent.append(
    buildMetaItem('Duration & credit points', course.duration),
    buildMetaItem('Delivery mode', course.delivery),
    buildMetaItem('Faculty', course.faculty),
    buildMetaItem('Study level', course.studyLevel),
  );

  const accordions = document.createElement('div');
  accordions.className = 'course-details-accordions';
  accordions.append(
    buildAccordion('introduction', 'Introduction', introContent, true),
    buildAccordion('learning-outcomes', 'Learning outcomes', outcomesContent),
    buildAccordion('career-pathways', 'Career pathways', careersContent),
    buildAccordion('course-requirements', 'Course requirements', requirementsContent),
  );

  root.append(hero, breadcrumb, meta, accordions);
  block.replaceChildren(root);
  document.title = `${course.name} | University of Canberra`;
}

function renderNotFound(block, code) {
  block.replaceChildren();

  const wrapper = document.createElement('div');
  wrapper.className = 'course-details-error';

  const heading = document.createElement('h2');
  heading.textContent = 'Course not found';

  const message = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = code;
  message.append('We could not find a course matching ', strong, '.');

  const back = document.createElement('p');
  const link = document.createElement('a');
  link.href = '/courses/default';
  link.textContent = 'Return to course search';
  back.append(link);

  wrapper.append(heading, message, back);
  block.append(wrapper);
}

export default async function decorate(block) {
  const courseCode = getCourseCodeFromPath();
  block.textContent = '';
  block.classList.add('loading');

  if (!courseCode) {
    block.innerHTML = '<p class="course-details-error">No course code found in the URL.</p>';
    block.classList.remove('loading');
    return;
  }

  try {
    const response = await fetch(getApiUrl(block));
    if (!response.ok) throw new Error(`Failed to load courses (${response.status})`);

    const data = await response.json();
    const course = data
      .map(normalizeCourse)
      .find((item) => item.code.toUpperCase() === courseCode);

    if (!course) {
      renderNotFound(block, courseCode);
      return;
    }

    renderCourse(block, course);
  } catch (error) {
    block.innerHTML = '<p class="course-details-error">Unable to load course details. Please try again later.</p>';
    // eslint-disable-next-line no-console
    console.error('course-details failed to load', error);
  } finally {
    block.classList.remove('loading');
  }
}
