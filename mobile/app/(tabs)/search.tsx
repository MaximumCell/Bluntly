import { Feather } from "@expo/vector-icons";
import { View, TextInput, ScrollView, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import { useApiClient, postsApi } from "@/utils/api";
import { MessageAPIService } from "@/utils/messageAPI";
import { useAuth } from "@clerk/clerk-expo";
import { User, Post } from "@/types";
import EnhancedRetroBackground from "@/components/animations/EnhancedRetroBackground";
import RetroTransition from "@/components/animations/RetroTransition";
import RetroLoader from "@/components/animations/RetroLoader";
import { router } from "expo-router";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const QUICK_ACTIONS = [
  {
    icon: "users" as const,
    title: "Discover Users",
    description: "Find and connect with new people",
    action: "users" as const
  },
  {
    icon: "file-text" as const,
    title: "Browse Posts",
    description: "Explore latest posts and discussions",
    action: "posts" as const
  },
  {
    icon: "hash" as const,
    title: "Popular Tags",
    description: "Search by hashtags and topics",
    action: "search" as const
  },
  {
    icon: "trending-up" as const,
    title: "What's Hot",
    description: "See what's trending right now",
    action: "trending" as const
  },
];

const SearchScreen = () => {
  const { currentTheme, currentPeriod } = useEnhancedTheme();
  const api = useApiClient();
  const { isLoaded } = useAuth();
  const { currentUser } = useCurrentUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "posts">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Debounced search function
  const debounce = (func: Function, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Search users by username
  const searchUsers = useCallback((query: string) => {
    if (!query.trim()) {
      setUsers(allUsers);
      return;
    }

    const filteredUsers = allUsers.filter(user =>
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(query.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(query.toLowerCase())
    );
    setUsers(filteredUsers);
  }, [allUsers]);

  // Search posts by content
  const searchPosts = useCallback((query: string) => {
    if (!query.trim()) {
      setPosts(allPosts);
      return;
    }

    const filteredPosts = allPosts.filter(post =>
      post.content.toLowerCase().includes(query.toLowerCase())
    );
    setPosts(filteredPosts);
  }, [allPosts]);

  // Debounced search functions
  const debouncedSearchUsers = useCallback(debounce(searchUsers, 300), [searchUsers]);
  const debouncedSearchPosts = useCallback(debounce(searchPosts, 300), [searchPosts]);

  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (activeTab === "users") {
      debouncedSearchUsers(text);
    } else {
      debouncedSearchPosts(text);
    }
  };

  // Fetch initial data
  const fetchData = async () => {
    if (!isLoaded || !currentUser) return;

    try {
      setLoading(true);
      console.log('🔍 Starting search data fetch...');

      // Fetch users and posts in parallel
      const [usersResult, postsResponse] = await Promise.all([
        MessageAPIService.searchUsers().catch((err: any) => {
          console.error('❌ Error fetching users:', err);
          return { success: false, users: [], error: err.message };
        }),
        postsApi.getPosts(api).catch((err: any) => {
          console.error('❌ Error fetching posts:', err);
          return { data: { posts: [] } };
        })
      ]);

      // Handle users data
      if (usersResult.success) {
        const fetchedUsers = usersResult.users || [];
        // Filter out current user
        const filteredUsers = fetchedUsers.filter((user: User) => user._id !== currentUser._id);
        console.log('✅ Fetched users count:', filteredUsers.length);
        setAllUsers(filteredUsers);
        setUsers(filteredUsers);
      } else {
        console.log('❌ Failed to fetch users:', usersResult.error);
        setAllUsers([]);
        setUsers([]);
      }

      // Handle posts data
      const fetchedPosts = postsResponse.data?.posts || postsResponse.data || [];
      console.log('✅ Fetched posts count:', fetchedPosts.length);
      setAllPosts(fetchedPosts);
      setPosts(fetchedPosts);

    } catch (error: any) {
      console.error('❌ Error in fetchData:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: "users" | "posts") => {
    setActiveTab(tab);
    // Apply current search query to new tab
    if (tab === "users") {
      searchUsers(searchQuery);
    } else {
      searchPosts(searchQuery);
    }
  };

  // Navigate to user profile
  const navigateToProfile = (username: string) => {
    router.push({
      pathname: '/userProfile',
      params: { username }
    });
  };

  // Navigate to post detail
  const navigateToPost = (postId: string) => {
    router.push({
      pathname: '/post/[id]',
      params: { id: postId }
    });
  };

  useEffect(() => {
    fetchData();
  }, [isLoaded, currentUser]);

  if (initialLoading) {
    return (
      <View style={{ flex: 1 }}>
        <EnhancedRetroBackground intensity={1.5}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 40
            }}>
              <RetroLoader style="neon" size="large" />
              <Text style={{
                marginTop: 20,
                color: currentTheme.colors.text,
                fontSize: 16,
                fontFamily: 'monospace',
                textAlign: 'center'
              }}>
                Loading search data...
              </Text>
            </View>
          </SafeAreaView>
        </EnhancedRetroBackground>
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <EnhancedRetroBackground
        intensity={1.5}
        showParticles={true}
        showObjects={true}
        showAtmosphere={true}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* ENHANCED HEADER */}
          <RetroTransition type="slideUp" delay={0}>
            <View style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: currentTheme.colors.surface + 'CC',
              borderBottomWidth: 2,
              borderBottomColor: currentTheme.colors.primary + '30',
              shadowColor: currentTheme.colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
            }}>
              {/* Enhanced Search Bar */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: currentTheme.colors.background + 'F0',
                borderRadius: 25,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 2,
                borderColor: searchQuery ? currentTheme.colors.primary + '60' : currentTheme.colors.primary + '30',
                shadowColor: currentTheme.colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 2,
              }}>
                <Feather
                  name="search"
                  size={20}
                  color={currentTheme.colors.primary}
                  style={{ marginRight: 12 }}
                />
                <TextInput
                  placeholder={`Search ${activeTab}...`}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: currentTheme.colors.text,
                    fontFamily: 'monospace',
                  }}
                  placeholderTextColor={currentTheme.colors.text + '80'}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery("");
                      setUsers(allUsers);
                      setPosts(allPosts);
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    <Feather
                      name="x"
                      size={18}
                      color={currentTheme.colors.text + '80'}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Enhanced Tab Selector */}
              <View style={{
                flexDirection: 'row',
                marginTop: 16,
                backgroundColor: currentTheme.colors.primary + '20',
                borderRadius: 15,
                padding: 4,
                borderWidth: 1,
                borderColor: currentTheme.colors.primary + '40',
              }}>
                <TouchableOpacity
                  onPress={() => handleTabChange("users")}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 12,
                    backgroundColor: activeTab === "users"
                      ? currentTheme.colors.primary
                      : 'transparent',
                    alignItems: 'center',
                    shadowColor: activeTab === "users" ? currentTheme.colors.primary : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: activeTab === "users" ? 3 : 0,
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: activeTab === "users"
                      ? currentTheme.colors.surface
                      : currentTheme.colors.text,
                    textShadowColor: activeTab === "users"
                      ? currentTheme.colors.primary + '40'
                      : 'transparent',
                    textShadowOffset: { width: 0.5, height: 0.5 },
                    textShadowRadius: 1,
                  }}>
                    Users ({users.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleTabChange("posts")}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 12,
                    backgroundColor: activeTab === "posts"
                      ? currentTheme.colors.primary
                      : 'transparent',
                    alignItems: 'center',
                    shadowColor: activeTab === "posts" ? currentTheme.colors.primary : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: activeTab === "posts" ? 3 : 0,
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: activeTab === "posts"
                      ? currentTheme.colors.surface
                      : currentTheme.colors.text,
                    textShadowColor: activeTab === "posts"
                      ? currentTheme.colors.primary + '40'
                      : 'transparent',
                    textShadowOffset: { width: 0.5, height: 0.5 },
                    textShadowRadius: 1,
                  }}>
                    Posts ({posts.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </RetroTransition>

          {/* MAIN CONTENT */}
          <ScrollView
            style={{ flex: 1, backgroundColor: 'transparent' }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {loading && (
              <RetroTransition type="fadeIn" delay={200}>
                <View style={{
                  padding: 40,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <RetroLoader style="cassette" size="medium" />
                  <Text style={{
                    marginTop: 16,
                    color: currentTheme.colors.text + 'CC',
                    fontSize: 14,
                    fontFamily: 'monospace'
                  }}>
                    Searching...
                  </Text>
                </View>
              </RetroTransition>
            )}

            {!loading && searchQuery && (
              <RetroTransition type="slideUp" delay={100}>
                <View style={{ padding: 16 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: currentTheme.colors.text,
                    marginBottom: 12,
                    textShadowColor: currentTheme.colors.primary + '40',
                    textShadowOffset: { width: 0.5, height: 0.5 },
                    textShadowRadius: 2,
                  }}>
                    Search Results for "{searchQuery}"
                  </Text>
                </View>
              </RetroTransition>
            )}

            {/* USERS TAB CONTENT */}
            {activeTab === "users" && (
              <View style={{ paddingHorizontal: 16 }}>
                {!loading && users.length === 0 && searchQuery ? (
                  <RetroTransition type="fadeIn" delay={300}>
                    <View style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 40,
                      minHeight: 200
                    }}>
                      <View style={{
                        padding: 20,
                        borderRadius: 50,
                        backgroundColor: currentTheme.colors.primary + '20',
                        borderWidth: 2,
                        borderColor: currentTheme.colors.primary + '40',
                        marginBottom: 20
                      }}>
                        <Feather name="users" size={48} color={currentTheme.colors.primary} />
                      </View>
                      <Text style={{
                        color: currentTheme.colors.text + 'DD',
                        textAlign: 'center',
                        fontSize: 18,
                        fontWeight: '600',
                      }}>
                        No users found
                      </Text>
                      <Text style={{
                        color: currentTheme.colors.text + '80',
                        textAlign: 'center',
                        fontSize: 14,
                        marginTop: 8,
                      }}>
                        Try searching with a different username
                      </Text>
                    </View>
                  </RetroTransition>
                ) : !loading && users.length === 0 && !searchQuery ? (
                  <RetroTransition type="fadeIn" delay={300}>
                    <View style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 40,
                      minHeight: 200
                    }}>
                      <View style={{
                        padding: 20,
                        borderRadius: 50,
                        backgroundColor: currentTheme.colors.primary + '20',
                        borderWidth: 2,
                        borderColor: currentTheme.colors.primary + '40',
                        marginBottom: 20
                      }}>
                        <Feather name="wifi-off" size={48} color={currentTheme.colors.primary} />
                      </View>
                      <Text style={{
                        color: currentTheme.colors.text + 'DD',
                        textAlign: 'center',
                        fontSize: 18,
                        fontWeight: '600',
                      }}>
                        No users available
                      </Text>
                      <Text style={{
                        color: currentTheme.colors.text + '80',
                        textAlign: 'center',
                        fontSize: 14,
                        marginTop: 8,
                      }}>
                        Check your connection or try again later
                      </Text>
                      <TouchableOpacity
                        onPress={fetchData}
                        style={{
                          marginTop: 16,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                          backgroundColor: currentTheme.colors.primary,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{
                          color: currentTheme.colors.surface,
                          fontWeight: '600',
                        }}>
                          Retry
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </RetroTransition>
                ) : (
                  users.map((user, index) => (
                    <RetroTransition key={user._id} type="slideUp" delay={index * 50}>
                      <TouchableOpacity
                        onPress={() => navigateToProfile(user.username)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 16,
                          marginVertical: 6,
                          backgroundColor: currentTheme.colors.surface + 'CC',
                          borderRadius: 16,
                          borderWidth: 2,
                          borderColor: currentTheme.colors.primary + '30',
                          shadowColor: currentTheme.colors.primary,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.15,
                          shadowRadius: 8,
                          elevation: 3,
                        }}
                      >
                        {/* Profile Picture */}
                        {user.profilePicture ? (
                          <Image
                            source={{ uri: user.profilePicture }}
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 25,
                              marginRight: 16,
                              borderWidth: 2,
                              borderColor: currentTheme.colors.primary + '60',
                            }}
                          />
                        ) : (
                          <View
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 25,
                              backgroundColor: currentTheme.colors.primary + 'DD',
                              marginRight: 16,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderWidth: 2,
                              borderColor: currentTheme.colors.primary + '60',
                            }}
                          >
                            <Text style={{
                              color: currentTheme.colors.surface,
                              fontWeight: 'bold',
                              fontSize: 18,
                            }}>
                              {user.firstName?.[0] || user.username[0]?.toUpperCase()}
                            </Text>
                          </View>
                        )}

                        <View style={{ flex: 1 }}>
                          <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: currentTheme.colors.text,
                            marginBottom: 4,
                          }}>
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.username
                            }
                          </Text>
                          <Text style={{
                            fontSize: 14,
                            color: currentTheme.colors.text + 'CC',
                            fontFamily: 'monospace',
                          }}>
                            @{user.username}
                          </Text>
                        </View>

                        <Feather
                          name="chevron-right"
                          size={20}
                          color={currentTheme.colors.primary}
                        />
                      </TouchableOpacity>
                    </RetroTransition>
                  ))
                )}
              </View>
            )}

            {/* POSTS TAB CONTENT */}
            {activeTab === "posts" && (
              <View style={{ paddingHorizontal: 16 }}>
                {!loading && posts.length === 0 && searchQuery ? (
                  <RetroTransition type="fadeIn" delay={300}>
                    <View style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 40,
                      minHeight: 200
                    }}>
                      <View style={{
                        padding: 20,
                        borderRadius: 50,
                        backgroundColor: currentTheme.colors.primary + '20',
                        borderWidth: 2,
                        borderColor: currentTheme.colors.primary + '40',
                        marginBottom: 20
                      }}>
                        <Feather name="file-text" size={48} color={currentTheme.colors.primary} />
                      </View>
                      <Text style={{
                        color: currentTheme.colors.text + 'DD',
                        textAlign: 'center',
                        fontSize: 18,
                        fontWeight: '600',
                      }}>
                        No posts found
                      </Text>
                      <Text style={{
                        color: currentTheme.colors.text + '80',
                        textAlign: 'center',
                        fontSize: 14,
                        marginTop: 8,
                      }}>
                        Try searching with different keywords
                      </Text>
                    </View>
                  </RetroTransition>
                ) : !loading && posts.length === 0 && !searchQuery ? (
                  <RetroTransition type="fadeIn" delay={300}>
                    <View style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 40,
                      minHeight: 200
                    }}>
                      <View style={{
                        padding: 20,
                        borderRadius: 50,
                        backgroundColor: currentTheme.colors.primary + '20',
                        borderWidth: 2,
                        borderColor: currentTheme.colors.primary + '40',
                        marginBottom: 20
                      }}>
                        <Feather name="wifi-off" size={48} color={currentTheme.colors.primary} />
                      </View>
                      <Text style={{
                        color: currentTheme.colors.text + 'DD',
                        textAlign: 'center',
                        fontSize: 18,
                        fontWeight: '600',
                      }}>
                        No posts available
                      </Text>
                      <Text style={{
                        color: currentTheme.colors.text + '80',
                        textAlign: 'center',
                        fontSize: 14,
                        marginTop: 8,
                      }}>
                        Check your connection or try again later
                      </Text>
                      <TouchableOpacity
                        onPress={fetchData}
                        style={{
                          marginTop: 16,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                          backgroundColor: currentTheme.colors.primary,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{
                          color: currentTheme.colors.surface,
                          fontWeight: '600',
                        }}>
                          Retry
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </RetroTransition>
                ) : (
                  posts.map((post, index) => (
                    <RetroTransition key={post._id} type="slideUp" delay={index * 50}>
                      <TouchableOpacity
                        onPress={() => navigateToPost(post._id)}
                        style={{
                          padding: 16,
                          marginVertical: 6,
                          backgroundColor: currentTheme.colors.surface + 'CC',
                          borderRadius: 16,
                          borderWidth: 2,
                          borderColor: currentTheme.colors.primary + '30',
                          shadowColor: currentTheme.colors.primary,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.15,
                          shadowRadius: 8,
                          elevation: 3,
                        }}
                      >
                        {/* Post Header */}
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 12
                        }}>
                          {post.user.profilePicture ? (
                            <Image
                              source={{ uri: post.user.profilePicture }}
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                marginRight: 12,
                                borderWidth: 2,
                                borderColor: currentTheme.colors.primary + '60',
                              }}
                            />
                          ) : (
                            <View
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: currentTheme.colors.primary + 'DD',
                                marginRight: 12,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 2,
                                borderColor: currentTheme.colors.primary + '60',
                              }}
                            >
                              <Text style={{
                                color: currentTheme.colors.surface,
                                fontWeight: 'bold',
                                fontSize: 14,
                              }}>
                                {post.user.firstName?.[0] || post.user.username[0]?.toUpperCase()}
                              </Text>
                            </View>
                          )}

                          <View style={{ flex: 1 }}>
                            <Text style={{
                              fontSize: 14,
                              fontWeight: '600',
                              color: currentTheme.colors.text,
                            }}>
                              {post.user.firstName && post.user.lastName
                                ? `${post.user.firstName} ${post.user.lastName}`
                                : post.user.username
                              }
                            </Text>
                            <Text style={{
                              fontSize: 12,
                              color: currentTheme.colors.text + 'CC',
                              fontFamily: 'monospace',
                            }}>
                              @{post.user.username}
                            </Text>
                          </View>
                        </View>

                        {/* Post Content */}
                        <Text style={{
                          fontSize: 15,
                          color: currentTheme.colors.text,
                          lineHeight: 22,
                          marginBottom: 12,
                        }}>
                          {post.content}
                        </Text>

                        {/* Post Image */}
                        {post.image && (
                          <Image
                            source={{ uri: post.image }}
                            style={{
                              width: '100%',
                              height: 200,
                              borderRadius: 12,
                              marginBottom: 12,
                              borderWidth: 1,
                              borderColor: currentTheme.colors.primary + '40',
                            }}
                            resizeMode="cover"
                          />
                        )}

                        {/* Post Stats */}
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: 12,
                          borderTopWidth: 1,
                          borderTopColor: currentTheme.colors.primary + '20'
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Feather
                              name="heart"
                              size={16}
                              color={currentTheme.colors.primary}
                              style={{ marginRight: 4 }}
                            />
                            <Text style={{
                              fontSize: 12,
                              color: currentTheme.colors.text + 'CC',
                              marginRight: 16,
                            }}>
                              {post.likes?.length || 0}
                            </Text>

                            <Feather
                              name="message-circle"
                              size={16}
                              color={currentTheme.colors.primary}
                              style={{ marginRight: 4 }}
                            />
                            <Text style={{
                              fontSize: 12,
                              color: currentTheme.colors.text + 'CC',
                            }}>
                              {post.comments?.length || 0}
                            </Text>
                          </View>

                          <Text style={{
                            fontSize: 11,
                            color: currentTheme.colors.text + '80',
                            fontFamily: 'monospace',
                          }}>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </RetroTransition>
                  ))
                )}
              </View>
            )}

            {/* QUICK ACTIONS SECTION */}
            {!searchQuery && (
              <RetroTransition type="slideUp" delay={200}>
                <View style={{ padding: 16 }}>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: currentTheme.colors.text,
                    marginBottom: 16,
                    textShadowColor: currentTheme.colors.primary + '40',
                    textShadowOffset: { width: 0.5, height: 0.5 },
                    textShadowRadius: 2,
                  }}>
                    Quick Actions
                  </Text>

                  {QUICK_ACTIONS.map((item, index) => (
                    <RetroTransition key={index} type="slideUp" delay={300 + (index * 50)}>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 16,
                          marginVertical: 4,
                          backgroundColor: currentTheme.colors.surface + 'AA',
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: currentTheme.colors.primary + '30',
                          shadowColor: currentTheme.colors.primary,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                        onPress={() => {
                          if (item.action === 'users') {
                            handleTabChange('users');
                          } else if (item.action === 'posts') {
                            handleTabChange('posts');
                          } else if (item.action === 'search') {
                            setSearchQuery('#');
                          }
                        }}
                      >
                        <View style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: currentTheme.colors.primary + '20',
                          borderWidth: 2,
                          borderColor: currentTheme.colors.primary + '40',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 16,
                        }}>
                          <Feather
                            name={item.icon}
                            size={20}
                            color={currentTheme.colors.primary}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: currentTheme.colors.text,
                            marginBottom: 4,
                          }}>
                            {item.title}
                          </Text>
                          <Text style={{
                            fontSize: 12,
                            color: currentTheme.colors.text + 'CC',
                            fontFamily: 'monospace',
                          }}>
                            {item.description}
                          </Text>
                        </View>

                        <Feather
                          name="chevron-right"
                          size={16}
                          color={currentTheme.colors.primary + '80'}
                        />
                      </TouchableOpacity>
                    </RetroTransition>
                  ))}

                  {/* Stats Section */}
                  <View style={{
                    marginTop: 20,
                    padding: 16,
                    backgroundColor: currentTheme.colors.primary + '10',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: currentTheme.colors.primary + '30',
                  }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: currentTheme.colors.text,
                      marginBottom: 12,
                      textAlign: 'center',
                    }}>
                      Community Stats
                    </Text>

                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{
                          fontSize: 20,
                          fontWeight: 'bold',
                          color: currentTheme.colors.primary,
                        }}>
                          {allUsers.length}
                        </Text>
                        <Text style={{
                          fontSize: 12,
                          color: currentTheme.colors.text + 'CC',
                          fontFamily: 'monospace',
                        }}>
                          Users
                        </Text>
                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <Text style={{
                          fontSize: 20,
                          fontWeight: 'bold',
                          color: currentTheme.colors.primary,
                        }}>
                          {allPosts.length}
                        </Text>
                        <Text style={{
                          fontSize: 12,
                          color: currentTheme.colors.text + 'CC',
                          fontFamily: 'monospace',
                        }}>
                          Posts
                        </Text>
                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <Text style={{
                          fontSize: 20,
                          fontWeight: 'bold',
                          color: currentTheme.colors.accent || currentTheme.colors.primary,
                        }}>
                          {new Date().toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                        <Text style={{
                          fontSize: 12,
                          color: currentTheme.colors.text + 'CC',
                          fontFamily: 'monospace',
                        }}>
                          Today
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </RetroTransition>
            )}
          </ScrollView>
        </SafeAreaView>
      </EnhancedRetroBackground>
    </View>
  );
};

export default SearchScreen;