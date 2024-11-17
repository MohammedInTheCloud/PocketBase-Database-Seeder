import pygame
import sys
from random import randint

pygame.init()

# Set up some constants
WIDTH, HEIGHT = 800, 600
FPS = 60
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

# Set up the display and clock
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Space Shooter")
clock = pygame.time.Clock()

class Projectile(pygame.sprite.Sprite):
    def __init__(self, x, y, projectile_type):
        super().__init__()
        self.type = projectile_type
        self.image = pygame.Surface((10, 5))
        if projectile_type == 'player':
            self.image.fill((0, 255, 0))
            self.speed = 5
        elif projectile_type == 'enemy':
            self.image.fill((255, 0, 0))
            self.speed = 3

        self.rect = self.image.get_rect(center=(x, y))

    def update(self):
        if self.type == 'player':
            self.rect.y -= self.speed
        elif self.type == 'enemy':
            self.rect.y += self.speed

    def draw(self, surface):
        surface.blit(self.image, self.rect)

class PlayerShip(pygame.sprite.Sprite):
    def __init__(self, x, y, color=(0, 255, 0), weapon_type='basic'):
        super().__init__()
        self.image = pygame.Surface((50, 50))
        self.image.fill(color)
        self.rect = self.image.get_rect(center=(x, y))
        self.speed = 5
        self.weapon_type = weapon_type
        self.score = 0
        self.shoot_cooldown = 0

    def update(self):
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT] and self.rect.left > 0:
            self.rect.x -= self.speed
        if keys[pygame.K_RIGHT] and self.rect.right < WIDTH:
            self.rect.x += self.speed
        if keys[pygame.K_SPACE] and self.shoot_cooldown == 0:
            self.shoot()
            self.shoot_cooldown = 10
        if self.shoot_cooldown > 0:
            self.shoot_cooldown -= 1

    def shoot(self):
        return Projectile(self.rect.centerx, self.rect.top, 'player')

    def draw(self, surface):
        surface.blit(self.image, self.rect)
        font = pygame.font.Font(None, 36)
        text = font.render(f"Score: {self.score}", True, WHITE)
        surface.blit(text, (10, 10))

class Enemy(pygame.sprite.Sprite):
    def __init__(self, x, y, speed):
        super().__init__()
        self.image = pygame.Surface((30, 30))
        self.image.fill((255, 0, 0))
        self.rect = self.image.get_rect(center=(x, y))
        self.speed = speed
        self.direction = (randint(-1, 1), 1)

    def update(self):
        self.rect.x += self.direction[0] * self.speed
        self.rect.y += self.direction[1] * self.speed

        if self.rect.left < 0 or self.rect.right > WIDTH:
            self.direction = (-self.direction[0], self.direction[1])

    def draw(self, surface):
        surface.blit(self.image, self.rect)

class FastEnemy(Enemy):
    def __init__(self, x, y):
        super().__init__(x, y, speed=7)
        self.image.fill((255, 165, 0))  # Orange color
        self.shoot_cooldown = 0

    def update(self):
        super().update()
        if self.shoot_cooldown == 0:
            self.shoot_cooldown = randint(30, 90)
        else:
            self.shoot_cooldown -= 1

    def shoot(self):
        return Projectile(self.rect.centerx, self.rect.bottom, 'enemy')

def main():
    player = PlayerShip(WIDTH // 2, HEIGHT - 50)
    enemies = pygame.sprite.Group()
    projectiles = pygame.sprite.Group()

    enemies.add(Enemy(randint(0, WIDTH), randint(-100, -30), speed=randint(3, 5)))
    enemies.add(FastEnemy(randint(0, WIDTH), randint(-100, -30)))

    running = True
    while running:
        clock.tick(FPS)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        screen.fill(BLACK)

        player.update()
        if pygame.key.get_pressed()[pygame.K_SPACE] and player.shoot_cooldown == 0:
            projectiles.add(player.shoot())

        enemies.update()
        projectiles.update()

        for enemy in enemies:
            if isinstance(enemy, FastEnemy) and enemy.shoot_cooldown == 0:
                projectiles.add(enemy.shoot())

        for projectile in projectiles:
            if projectile.rect.bottom < 0 or projectile.rect.top > HEIGHT:
                projectile.kill()

        player_hit = pygame.sprite.spritecollide(player, projectiles, True)
        for hit in player_hit:
            if hit.type == 'enemy':
                player.score -= 5

        enemies_hit = pygame.sprite.groupcollide(enemies, projectiles, True, True)
        for enemy in enemies_hit:
            if isinstance(enemy, FastEnemy):
                player.score += 15
            else:
                player.score += 10

        if len(enemies) < 5 and randint(1, 50) == 1:
            if randint(1, 4) == 1:
                enemies.add(FastEnemy(randint(0, WIDTH), randint(-100, -30)))
            else:
                enemies.add(Enemy(randint(0, WIDTH), randint(-100, -30), speed=randint(3, 5)))

        player.draw(screen)
        enemies.draw(screen)
        projectiles.draw(screen)

        pygame.display.flip()

    pygame.quit()
    print(f"Final Score: {player.score}")

if __name__ == "__main__":
    main()