import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/site-url';
import { getPublicAnnouncementCards } from '@/lib/site-data';

export async function GET() {
  const baseUrl = getSiteUrl();
  
  try {
    const announcements = await getPublicAnnouncementCards();
    
    const rssItems = announcements.slice(0, 20).map((announcement) => {
      const pubDate = new Date(announcement.date).toUTCString();
      const link = `${baseUrl}/announcements/${announcement._id}`;
      
      return `
        <item>
          <title><![CDATA[${announcement.title}]]></title>
          <description><![CDATA[${announcement.subtitle || announcement.description || ''}]]></description>
          <link>${link}</link>
          <guid isPermaLink="true">${link}</guid>
          <pubDate>${pubDate}</pubDate>
          <category><![CDATA[${announcement.category}]]></category>
          ${announcement.coverImage ? `<enclosure url="${baseUrl}${announcement.coverImage}" type="image/jpeg" />` : ''}
        </item>
      `.trim();
    }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Mar Mathew Kavukatt - Announcements</title>
    <description>Latest announcements and news from Mar Mathew Kavukatt official website</description>
    <link>${baseUrl}</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <generator>Mar Mathew Kavukatt Website</generator>
    <webMaster>webmaster@yourdomain.com (Web Master)</webMaster>
    <managingEditor>editor@yourdomain.com (Editor)</managingEditor>
    <copyright>Copyright ${new Date().getFullYear()} Mar Mathew Kavukatt Foundation</copyright>
    <category>Religion</category>
    <category>Catholic Church</category>
    <category>Spirituality</category>
    <ttl>60</ttl>
    <image>
      <url>${baseUrl}/uploads/mar-mathew-kavukatt-church-logo.jpg</url>
      <title>Mar Mathew Kavukatt</title>
      <link>${baseUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    ${rssItems}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
