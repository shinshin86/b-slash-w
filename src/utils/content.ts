import markdownIt from 'markdown-it';
const mi = markdownIt({ breaks: true });

export const getDescriptionText = (text: string): string => {
  if (text.length <= 30) {
    return text;
  } else {
    return text.slice(0, 30) + '...';
  }
};

export const renderHTML = (markdownText: string): string => {
  const renderedText = mi.render(markdownText);
  const regexH1 = /<h1>/;
  const regexH2 = /<h2>/;

  if (regexH1.test(renderedText)) {
    console.warn(
      'Warn: Do not use descriptions that convert to h1 tags, as this will generate sites that are not SEO correct.'
    );
  }

  if (regexH2.test(renderedText)) {
    console.warn(
      'Warn: Do not use descriptions that convert to h2 tags, as this will generate sites that are not SEO correct.'
    );
  }

  return renderedText;
};

export const getTextContent = (html: string): string => {
  const regex = /(<([^>]+)>)/gi;
  return renderHTML(html).replace(regex, '');
};