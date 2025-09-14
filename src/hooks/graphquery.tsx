import axios from "axios";
import { useEffect, useRef, useState } from "react";

export async function runGraphQuery(endpoint: string, query: string, variables: any) {
  try {
    const res = await axios.post(
      endpoint,
      { query, variables },
      { headers: { 'Content-Type': 'application/json' }, timeout: 30_000 }
    );
    return res.data?.data;
  } catch (err) {
    return null;
  }
}

export function useGraphQuery<TData = any, TVariables extends Record<string, any> = Record<string, any>>(
  endpoint: string,
  query: string,
  initialVariables: TVariables,
  opts?: {
    auto?: boolean;
    onCompleted?: (data: TData | null) => void;
    onError?: (error: any) => void;
  }
) {
  const { auto = true, onCompleted, onError } = opts || {};
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState<boolean>(!!auto);
  const [error, setError] = useState<any>(null);
  const [variables, setVariables] = useState<TVariables>(initialVariables);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchOnce = async (vars: TVariables): Promise<TData | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await runGraphQuery(endpoint, query, vars);
      if (!mountedRef.current) return null;

      // runGraphQuery 在出错时返回 null，这里统一处理为 error
      if (result == null) {
        const err = new Error('GraphQL request failed or returned null');
        setError(err);
        onError?.(err);
        setData(null);
        return null;
      }

      setData(result as TData);
      onCompleted?.(result as TData);
      return result as TData;
    } catch (e) {
      if (!mountedRef.current) return null;
      setError(e);
      onError?.(e);
      setData(null);
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  // 外部可手动触发，支持临时覆盖/合并变量
  const refetch = async (next?: Partial<TVariables>) => {
    const merged = (next ? { ...variables, ...next } : variables) as TVariables;
    // 保持内部变量与本次请求一致
    setVariables(merged);
    return fetchOnce(merged);
  };

  // 自动请求：endpoint/query/variables 变化时触发
  useEffect(() => {
    if (!auto) return;
    // 依赖 variables 的深相等，这里用 JSON 字符串化简化处理
    fetchOnce(variables);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, query, JSON.stringify(variables), auto]);

  return {
    data,
    loading,
    error,
    variables,
    setVariables,
    refetch,
  };
}
