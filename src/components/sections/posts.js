import React, { useState, useEffect, useRef } from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { srConfig } from '@config';
import kebabCase from 'lodash/kebabCase';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { Icon } from '../icons';

const StyledPostsSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    font-size: clamp(24px, 5vw, var(--fz-heading));
  }

  .archive-link {
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
    &:after {
      bottom: 0.1em;
    }
  }

  .posts-grid {
    width: 100%;
    ${({ theme }) => theme.mixins.resetList};
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 15px;
    position: relative;
    margin-top: 50px;

    @media (max-width: 1080px) {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }

  .more-button {
    ${({ theme }) => theme.mixins.button};
    margin: 80px auto 0;
  }
`;

const StyledPost = styled.li`
  position: relative;
  cursor: default;
  transition: var(--transition);

  @media (prefers-reduced-motion: no-preference) {
    &:hover,
    &:focus-within {
      .post-inner {
        transform: translateY(-7px);
      }
    }
  }

  a {
    position: relative;
    z-index: 1;
  }

  .post-inner {
    ${({ theme }) => theme.mixins.boxShadow};
    ${({ theme }) => theme.mixins.flexBetween};
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    height: 100%;
    padding: 2rem 1.75rem;
    border-radius: var(--border-radius);
    background-color: var(--light-navy);
    transition: var(--transition);
  }

  .post-top {
    ${({ theme }) => theme.mixins.flexBetween};
    margin-bottom: 35px;

    .post {
      color: var(--red);
      svg {
        width: 40px;
        height: 40px;
      }
    }

    .post-links {
      display: flex;
      align-items: center;
      margin-right: -10px;
      color: var(--light-slate);

      a {
        ${({ theme }) => theme.mixins.flexCenter};
        padding: 5px 7px;

        &.external {
          svg {
            width: 22px;
            height: 22px;
            margin-top: -4px;
          }
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }
    }
  }

  .post-title {
    margin: 0 0 10px;
    color: var(--lightest-slate);
    font-size: var(--fz-xxl);

    a {
      position: static;

      &:before {
        content: '';
        display: block;
        position: absolute;
        z-index: 0;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }
    }
  }

  .post-date {
    color: var(--light-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    text-transform: uppercase;
  }
  ul.post-tags {
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      color: var(--red);
      font-family: var(--font-mono);
      font-size: var(--fz-xxs);
      line-height: 1.75;

      &:not(:last-of-type) {
        margin-right: 15px;
      }
    }
  }
`;

const Posts = () => {
  const data = useStaticQuery(graphql`
    query {
      posts: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/posts/" }, frontmatter: { draft: { ne: true } } }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        edges {
          node {
            frontmatter {
              title
              description
              slug
              date
              tags
              draft
            }
            html
          }
        }
      }
    }
  `);

  const [showMore, setShowMore] = useState(false);
  const revealTitle = useRef(null);
  const revealArchiveLink = useRef(null);
  const revealPosts = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    sr.reveal(revealArchiveLink.current, srConfig());
    revealPosts.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  const GRID_LIMIT = 6;
  const posts = data.posts.edges.filter(({ node }) => node);
  const firstSix = posts.slice(0, GRID_LIMIT);
  const postsToShow = showMore ? posts : firstSix;
  const showMoreBtnVisible = posts.length > GRID_LIMIT;
  const postInner = node => {
    const { frontmatter } = node;
    const { title, description, slug, date, tags } = frontmatter;
    const formattedDate = new Date(date).toLocaleDateString();

    return (
      <div className="post-inner">
        <header>
          <div className="post-top">
            <div className="post">
              <Icon name="Bookmark" />
            </div>
          </div>
          <h5 className="post-title">
            <Link to={slug}>{title}</Link>
          </h5>
          <p className="post-description">{description}</p>
        </header>

        <footer>
          <span className="post-date">{formattedDate}</span>
          <ul className="post-tags">
            {tags.map((tag, i) => (
              <li key={i}>
                <Link to={`/blogs/tags/${kebabCase(tag)}/`} className="inline-link">
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        </footer>
      </div>
    );
  };

  return (
    <StyledPostsSection>
      <h2 ref={revealTitle}>Bài viết</h2>

      <Link className="inline-link archive-link" to="/blogs" ref={revealArchiveLink}>
        Xem đầy đủ
      </Link>

      <ul className="posts-grid">
        {prefersReducedMotion ? (
          <>
            {postsToShow &&
              postsToShow.map(({ node }, i) => <StyledPost key={i}>{postInner(node)}</StyledPost>)}
          </>
        ) : (
          <TransitionGroup component={null}>
            {postsToShow &&
              postsToShow.map(({ node }, i) => (
                <CSSTransition
                  key={i}
                  classNames="fadeup"
                  timeout={i >= GRID_LIMIT ? (i - GRID_LIMIT) * 300 : 300}
                  exit={false}>
                  <StyledPost
                    key={i}
                    ref={el => (revealPosts.current[i] = el)}
                    style={{
                      transitionDelay: `${i >= GRID_LIMIT ? (i - GRID_LIMIT) * 100 : 0}ms`,
                    }}>
                    {postInner(node)}
                  </StyledPost>
                </CSSTransition>
              ))}
          </TransitionGroup>
        )}
      </ul>
      {showMoreBtnVisible && (
        <button className="more-button" onClick={() => setShowMore(!showMore)}>
          {showMore ? 'Thu gọn' : 'Xem thêm'}
        </button>
      )}
    </StyledPostsSection>
  );
};

export default Posts;
