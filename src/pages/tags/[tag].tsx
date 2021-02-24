import Layout from '../../components/Layout';
import Analytics from '../../components/Analytics';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LinkCard from '../../components/LinkCard';
import PageTopButton from '../../components/PageTopButton';
import OtherLinks from '../../components/OtherLinks';
import AvatarImage from '../../components/AvatarImage';
import { getTagList } from '../../utils/tags';
import { isValidData } from '../../utils/validate';
import { getLinks, chackHasOtherLinks } from '../../utils/link';
import { General, Meta, Content } from '../../utils/sheet-data';
import { GetStaticPaths, GetStaticProps } from 'next';

export const config = {
  amp: true,
};

const TagPage: React.FC<{
  general: General;
  content: Array<Content>;
  meta: Meta;
  tag: string;
}> = ({ general, content, meta, tag }): JSX.Element => {
  const { title, logoImage, logoImageAltText } = general;

  const links = getLinks(general);
  const hasOtherLinks = chackHasOtherLinks(links);

  const { googleAnalyticsTrackingId, googleSiteVerificationCode } = meta;

  return (
    <Layout>
      <Header
        siteUrl={meta.siteUrl}
        title={meta.title}
        description={meta.description}
        ogpImage={meta.ogpImage}
        googleSiteVerificationCode={googleSiteVerificationCode}
      />
      {googleAnalyticsTrackingId && (
        <Analytics trackingId={googleAnalyticsTrackingId} />
      )}
      {/* Wrapper */}
      <div id="wrapper">
        <div className="target">
          <a className="target-anchor" id="top"></a>
          <amp-position-observer
            on="enter:hideAnim.start; exit:showAnim.start"
            layout="nodisplay"
          ></amp-position-observer>
        </div>
        {/* Main */}
        <section id="main">
          <header>
            <a href="/">
              <AvatarImage imageUrl={logoImage} altText={logoImageAltText} />
            </a>
            <a href="/">
              <h1>{title}</h1>
            </a>
            <p>Tag - {tag}</p>
          </header>
          {content.map((data, index) => (
            <LinkCard {...data} key={index} />
          ))}
          <hr />
          {hasOtherLinks && (
            <div>
              <h3>LINKS</h3>
              <OtherLinks links={links} />
            </div>
          )}
        </section>
        <Footer />
      </div>
      <PageTopButton />
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  if (!process.env.SHEET_URL) {
    throw new Error('BUILD ERROR: Setting the SHEET_URL is required.');
  }

  const { SHEET_URL } = process.env;

  const response = await fetch(SHEET_URL).then((r) => r.json());

  const tagList = [];
  for (const c of response.content) {
    const tList = getTagList(c.tags);
    if (!tList.length) {
      continue;
    }

    tagList.push(...tList);
  }

  const uniqueTagList = tagList.filter(
    (tag, index, self) => self.indexOf(tag) === index
  );
  const paths = uniqueTagList.map((t) => `/tags/${t}`);

  return { paths, fallback: false };
};

type Params = {
  params: {
    tag: string;
  };
};

export const getStaticProps: GetStaticProps = async ({ params }: Params) => {
  if (!process.env.SHEET_URL) {
    throw new Error('BUILD ERROR: Setting the SHEET_URL is required.');
  }

  const { SHEET_URL } = process.env;

  const response = await fetch(SHEET_URL).then((r) => r.json());
  const { general, meta, content } = response;

  const contentList = content.filter((c: Content) => {
    return getTagList(c.tags).includes(params.tag);
  });

  if (!isValidData(general, meta, contentList)) {
    throw new Error('BUILD ERROR: Invalid sheet data');
  }

  return {
    props: {
      general,
      meta,
      content: contentList,
      tag: params.tag,
    },
  };
};

export default TagPage;
