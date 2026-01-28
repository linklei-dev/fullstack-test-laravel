import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import PostCard from './PostCard';
import './Feed.css';

const PER_PAGE = 15;

export default function Feed({
  onPostUpdate,
  prependPost,
  onPrependConsumed,
  updatedPost,
  onUpdatedConsumed,
  optimisticPost,
  onClearOptimistic,
  optimisticUpdatedPost,
  revertPost,
  onRevertConsumed,
}) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const loadPage = useCallback(async (pageNum, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const res = await api.getPosts(pageNum, PER_PAGE);
      const list = res?.data ?? res ?? [];
      const items = Array.isArray(list) ? list : (list?.data ?? []);
      if (append) {
        setPosts((prev) => [...prev, ...items]);
      } else {
        setPosts(items);
      }
      const total = res?.meta?.total ?? res?.total ?? 0;
      const current = res?.meta?.current_page ?? pageNum;
      const last = res?.meta?.last_page ?? (Math.ceil(total / PER_PAGE) || 1);
      setHasMore(current < last);
    } catch (e) {
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1, false);
  }, [loadPage]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading || loadingMore) return;
    const el = sentinelRef.current;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPage((p) => {
            loadPage(p + 1, true);
            return p + 1;
          });
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );
    observerRef.current.observe(el);
    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, loading, loadingMore, loadPage]);

  useEffect(() => {
    if (!prependPost) return;
    setPosts((prev) => {
      const exists = prev.some((p) => p.id === prependPost.id || String(p.id) === String(prependPost.id));
      if (exists) return prev;
      return [prependPost, ...prev];
    });
    onPrependConsumed?.();
  }, [prependPost, onPrependConsumed]);

  useEffect(() => {
    if (!updatedPost) return;
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
    onUpdatedConsumed?.();
  }, [updatedPost, onUpdatedConsumed]);

  useEffect(() => {
    if (!revertPost) return;
    setPosts((prev) =>
      prev.map((p) => (p.id === revertPost.id ? revertPost : p))
    );
    onRevertConsumed?.();
  }, [revertPost, onRevertConsumed]);

  const displayPosts = [...posts];
  if (optimisticPost) {
    const hasOptimistic = displayPosts.some(
      (p) => String(p.id) === String(optimisticPost.id)
    );
    if (!hasOptimistic) {
      displayPosts.unshift(optimisticPost);
    }
  }
  const merged = optimisticUpdatedPost
    ? displayPosts.map((p) =>
        p.id === optimisticUpdatedPost.id ? optimisticUpdatedPost : p
      )
    : displayPosts;

  return (
    <div className="feed">
      {loading && merged.length === 0 ? (
        <p className="feed-loading">Carregando...</p>
      ) : (
        <>
          <ul className="feed-list">
            {merged.map((post) => (
              <li key={post.id}>
                <PostCard post={post} onEdit={onPostUpdate} />
              </li>
            ))}
          </ul>
          {optimisticPost && !prependPost && (
            <p className="feed-optimistic-hint">Publicando...</p>
          )}
          <div ref={sentinelRef} className="feed-sentinel" aria-hidden />
          {loadingMore && <p className="feed-loading-more">Carregando mais...</p>}
        </>
      )}
    </div>
  );
}
