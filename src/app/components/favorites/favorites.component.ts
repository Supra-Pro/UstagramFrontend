import { Component, OnInit } from '@angular/core';
import { FavoritesService } from '../../services/favourite-service.service';
import { AuthServiceService } from '../../services/auth-service.service';
import { Router } from '@angular/router';
import { Favourite } from '../../interfaces/favourite'; 

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favorites: Favourite[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private favoritesService: FavoritesService,
    private authService: AuthServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  async loadFavorites(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = null;
      
      const response = await this.favoritesService.getFavoritesByUser().toPromise();
      
      if (response) {
        this.favorites = response.map((fav: any) => ({
          id: fav.id,
          postId: fav.postId,
          userId: fav.userId,
          post: {
            id: fav.post?.id || fav.postId,
            photoUrl: fav.post?.photoUrl || 'assets/default-post.jpg',
            description: fav.post?.description || '',
            date: fav.post?.date || new Date().toISOString(),
            likes: fav.post?.likes || 0,
            comments: fav.post?.comments || [],
            user: {
              username: fav.post?.user?.username || fav.user?.username || 'Unknown',
              photoPath: fav.post?.user?.photoPath || fav.user?.photoPath || 'assets/default-profile.jpg'
            }
          },
          user: {
            username: fav.user?.username || 'Unknown',
            photoPath: fav.user?.photoPath || 'assets/default-profile.jpg'
          }
        }));
      }
    } catch (error: unknown) {
      console.error('Error loading favorites:', error);
      this.errorMessage = 'Failed to load favorites. Please try again.';
      
      if (error instanceof Error && 'status' in error && error.status === 401) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    } finally {
      this.isLoading = false;
    }
  }

  removeFavorite(favoriteId: string): void {
    this.favoritesService.deleteFavorite(favoriteId).subscribe(
      () => {
        this.favorites = this.favorites.filter(fav => fav.id !== favoriteId);
      },
      (error) => {
        console.error('Error removing favorite:', error);
      }
    );
  }

  viewPost(postId: string): void {
    this.router.navigate(['/post', postId]);
  }

  viewUserProfile(user: any): void {
    if (user && user.username) {
      this.router.navigate(['/user', user.username]);
    }
  }
}