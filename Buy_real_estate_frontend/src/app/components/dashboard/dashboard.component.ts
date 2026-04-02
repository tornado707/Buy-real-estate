import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PropertyService, Property, CreatePropertyData } from '../../services/property.service';
import { FavoriteService, Favorite } from '../../services/favorite.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  username = '';
  role = '';
  userId = '';
  loading = true;
  logoutLoading = false;

  // Property form
  propertyForm: CreatePropertyData = {
    type: 'House',
    location: '',
    area: 0,
    nearestLandmark: '',
    price: 0
  };
  propertyTypes = ['House', 'Villa', 'Apartment', 'Land'];
  formLoading = false;
  formMessage = '';
  formError = false;

  // Property list
  properties: Property[] = [];
  listLoading = false;
  currentPage = 1;
  totalPages = 1;
  total = 0;

  // Edit mode
  editingId: string | null = null;

  // Favorites
  favoriteIds: Set<string> = new Set();
  showFavoritesOnly = false;
  favoriteProperties: Property[] = [];
  favCurrentPage = 1;
  favTotalPages = 1;
  favTotal = 0;
  favLoading = false;

  constructor(
    private authService: AuthService,
    private propertyService: PropertyService,
    private favoriteService: FavoriteService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getMe().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.user) {
          this.username = response.user.username;
          this.role = response.user.role;
          this.userId = response.user.id;
        }
        this.loadProperties();
        this.loadFavoriteIds();
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/auth']);
      }
    });
  }

  get isSuAdmin(): boolean {
    return this.role === 'su-admin';
  }

  canEdit(createdBy: string): boolean {
    return this.isSuAdmin || createdBy === this.userId;
  }

  loadProperties() {
    this.listLoading = true;
    this.propertyService.getProperties(this.currentPage).subscribe({
      next: (response) => {
        this.listLoading = false;
        if (response.success) {
          this.properties = response.properties;
          this.totalPages = response.totalPages;
          this.total = response.total;
        }
      },
      error: () => {
        this.listLoading = false;
      }
    });
  }

  loadFavoriteIds() {
    this.favoriteService.getFavorites(1).subscribe({
      next: (response) => {
        if (response.success) {
          this.favoriteIds = new Set(response.favorites.map(f => f.propertyId._id));
        }
      },
      error: () => {}
    });
  }

  loadFavoriteProperties() {
    this.favLoading = true;
    this.favoriteService.getFavorites(this.favCurrentPage).subscribe({
      next: (response) => {
        this.favLoading = false;
        if (response.success) {
          this.favoriteProperties = response.favorites.map(f => f.propertyId);
          this.favTotalPages = response.totalPages;
          this.favTotal = response.total;
          this.favoriteIds = new Set(response.favorites.map(f => f.propertyId._id));
        }
      },
      error: () => {
        this.favLoading = false;
      }
    });
  }

  isFavorite(propertyId: string): boolean {
    return this.favoriteIds.has(propertyId);
  }

  toggleFavorite(propertyId: string) {
    if (this.isFavorite(propertyId)) {
      this.favoriteService.removeFavorite(propertyId).subscribe({
        next: (response) => {
          if (response.success) {
            this.favoriteIds.delete(propertyId);
            if (this.showFavoritesOnly) {
              this.loadFavoriteProperties();
            }
          }
        },
        error: () => {}
      });
    } else {
      this.favoriteService.addFavorite(propertyId).subscribe({
        next: (response) => {
          if (response.success) {
            this.favoriteIds.add(propertyId);
          }
        },
        error: () => {}
      });
    }
  }

  toggleFavoritesView() {
    this.showFavoritesOnly = !this.showFavoritesOnly;
    if (this.showFavoritesOnly) {
      this.favCurrentPage = 1;
      this.loadFavoriteProperties();
    }
  }

  onSubmitProperty() {
    if (!this.propertyForm.location || !this.propertyForm.area || !this.propertyForm.nearestLandmark || !this.propertyForm.price) {
      this.formMessage = 'Please fill in all fields.';
      this.formError = true;
      return;
    }

    this.formLoading = true;
    this.formMessage = '';

    if (this.editingId) {
      this.propertyService.updateProperty(this.editingId, this.propertyForm).subscribe({
        next: (response) => {
          this.formLoading = false;
          if (response.success) {
            this.formMessage = 'Property updated successfully!';
            this.formError = false;
            this.cancelEdit();
            if (this.showFavoritesOnly) {
              this.loadFavoriteProperties();
            } else {
              this.loadProperties();
            }
          }
        },
        error: (err) => {
          this.formLoading = false;
          this.formMessage = err.error?.message || 'Failed to update property.';
          this.formError = true;
        }
      });
    } else {
      this.propertyService.createProperty(this.propertyForm).subscribe({
        next: (response) => {
          this.formLoading = false;
          if (response.success) {
            this.formMessage = 'Property added successfully!';
            this.formError = false;
            this.resetForm();
            this.currentPage = 1;
            this.loadProperties();
          }
        },
        error: (err) => {
          this.formLoading = false;
          this.formMessage = err.error?.message || 'Failed to add property.';
          this.formError = true;
        }
      });
    }
  }

  resetForm() {
    this.propertyForm = {
      type: 'House',
      location: '',
      area: 0,
      nearestLandmark: '',
      price: 0
    };
  }

  onEditProperty(property: Property) {
    this.editingId = property._id;
    this.propertyForm = {
      type: property.type,
      location: property.location,
      area: property.area,
      nearestLandmark: property.nearestLandmark,
      price: property.price
    };
    this.formMessage = '';
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
  }


  onDeleteProperty(id: string) {
    this.propertyService.deleteProperty(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.favoriteIds.delete(id);
          if (this.showFavoritesOnly) {
            this.loadFavoriteProperties();
          } else {
            this.loadProperties();
          }
        }
      },
      error: () => {}
    });
  }

  goToPage(page: number) {
    if (this.showFavoritesOnly) {
      if (page < 1 || page > this.favTotalPages) return;
      this.favCurrentPage = page;
      this.loadFavoriteProperties();
    } else {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.loadProperties();
    }
  }

  onLogout() {
    this.logoutLoading = true;

    this.authService.signout().subscribe({
      next: () => {
        this.logoutLoading = false;
        this.router.navigate(['/auth']);
      },
      error: () => {
        this.logoutLoading = false;
        this.router.navigate(['/auth']);
      }
    });
  }
}
