import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { PostRow } from "../../../types/contentTypes";

export function usePosts() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) setError(error);
    setPosts((data ?? []) as PostRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
}