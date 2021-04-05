import { dedupExchange, Exchange, fetchExchange, stringifyVariables } from 'urql';
import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import {
    LogoutMutation,
    MeQuery,
    MeDocument,
    LoginMutation,
    RegisterMutation,
} from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
import { pipe, tap } from 'wonka';
import { Router } from 'next/router';
import { introspectionFromSchema } from 'graphql';

const errorExchange: Exchange = ({ forward }) => ops$ => {
    return pipe(
        forward(ops$),
        tap(({ error }) => {
            // If the OperationResult has an error send a request to sentry
            if (error?.message.includes('Not Authenticated')) {
                Router.prototype.replace('/login');
            }
        })
    );
};

export const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;

        // entityKey = Query
        // fieldName = posts
        // fieldArgs = {limit: 10, cursor: whatever}

        const allFields = cache.inspectFields(entityKey);
        /* allFields = {
            fieldKey: 'posts({"limit":33})',
            fieldName: 'posts',
            arguments: { limit: 33 }
          } */

        const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        // fieldkey = 'posts({limit: 10, cursor: whatever})
        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;

        // cache stores requests by fieldkey, check if it has been called before
        const isItInTheCash = cache.resolve(cache.resolve(entityKey, fieldKey) as string, 'posts');
        // if its not in the cache, need to make the request
        info.partial = !isItInTheCash;

        let hasMore = true;
        let results: string[] = [];
        fieldInfos.forEach(fi => {
            const key = cache.resolve(entityKey, fi.fieldKey) as string;
            // key = 'Query.posts({"limit":10)};
            const data = cache.resolve(key, 'posts') as string[];
            const _hasMore = cache.resolve(key, 'hasMore');
            if (!_hasMore) {
                hasMore = _hasMore as boolean;
            }
            results.push(...data);
        });

        /* results [
            'Post:161', 'Post:167', 'Post:154',
            'Post:155', 'Post:156', 'Post:168',
            'Post:109', 'Post:164', 'Post:133',
            'Post:132', 'Post:116', 'Post:121',
            'Post:135', 'Post:110', 'Post:186',
            'Post:194', 'Post:139', 'Post:134',
            'Post:180', 'Post:187', 'Post:131',
            'Post:122', 'Post:169', 'Post:173',
            'Post:165', 'Post:123', 'Post:130',
            'Post:138', 'Post:190', 'Post:178',
            'Post:115', 'Post:124', 'Post:196'
            ] */

        return {
            __typename: 'PaginatedPosts',
            hasMore,
            posts: results,
        };

        // const visited = new Set();
        // let result: NullArray<string> = [];
        // let prevOffset: number | null = null;

        // for (let i = 0; i < size; i++) {
        //     const { fieldKey, arguments: args } = fieldInfos[i];
        //     if (args === null || !compareArgs(fieldArgs, args)) {
        //         continue;
        //     }

        //     const links = cache.resolve(entityKey, fieldKey) as string[];
        //     const currentOffset = args[cursorArgument];

        //     if (links === null || links.length === 0 || typeof currentOffset !== 'number') {
        //         continue;
        //     }

        //     const tempResult: NullArray<string> = [];

        //     for (let j = 0; j < links.length; j++) {
        //         const link = links[j];
        //         if (visited.has(link)) continue;
        //         tempResult.push(link);
        //         visited.add(link);
        //     }

        //     if ((!prevOffset || currentOffset > prevOffset) === (mergeMode === 'after')) {
        //         result = [...result, ...tempResult];
        //     } else {
        //         result = [...tempResult, ...result];
        //     }

        //     prevOffset = currentOffset;
        // }

        // const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
        // if (hasCurrentPage) {
        //     return result;
        // } else if (!(info as any).store.schema) {
        //     return undefined;
        // } else {
        //     info.partial = true;
        //     return result;
        // }
    };
};

export const createUrqlClient = (ssrExchange: any) => ({
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
        credentials: 'include' as const,
    },
    exchanges: [
        dedupExchange,
        cacheExchange({
            keys: {
                PaginatedPosts: () => null,
            },
            resolvers: {
                Query: {
                    posts: cursorPagination(),
                },
            },
            updates: {
                Mutation: {
                    logout: (_result, arg, cache, info) => {
                        betterUpdateQuery<LogoutMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            () => ({ me: null })
                        );
                    },
                    login: (_result, arg, cache, info) => {
                        betterUpdateQuery<LoginMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            (result, query) => {
                                if (result.login.errors) {
                                    return query;
                                } else {
                                    return {
                                        me: result.login.user,
                                    };
                                }
                            }
                        );
                    },
                    register: (_result, arg, cache, info) => {
                        betterUpdateQuery<RegisterMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            (result, query) => {
                                if (result.register.errors) {
                                    return query;
                                } else {
                                    return {
                                        me: result.register.user,
                                    };
                                }
                            }
                        );
                    },
                },
            },
        }),
        errorExchange,
        ssrExchange,
        fetchExchange,
    ],
});