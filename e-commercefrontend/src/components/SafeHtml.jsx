import DOMPurify from 'dompurify';

function SafeHtml({ html }) {
  const cleanHtml = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}

export default SafeHtml;
