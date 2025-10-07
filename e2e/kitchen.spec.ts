import { test, expect } from '@playwright/test'

test.describe('Kitchen Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kitchen')
  })

  test.describe('Densidade de Cards', () => {
    test('deve mudar densidade dos cards ao clicar nos controles', async ({ page }) => {
      // Verificar densidade padrão
      await expect(page.getByTestId('density-normal')).toHaveAttribute('aria-pressed', 'true')

      // Mudar para compacta
      await page.getByTestId('density-compact').click()
      await expect(page.getByTestId('density-compact')).toHaveAttribute('aria-pressed', 'true')

      // Mudar para confortável
      await page.getByTestId('density-comfortable').click()
      await expect(page.getByTestId('density-comfortable')).toHaveAttribute('aria-pressed', 'true')
    })

    test('deve manter alta densidade de cards visíveis em mobile', async ({ page, viewport }) => {
      if (viewport?.width && viewport.width <= 640) {
        // Mudar para compacta
        await page.getByTestId('density-compact').click()

        // Aguardar renderização
        await page.waitForTimeout(500)

        // Verificar que há pelo menos 4 cards visíveis acima da borda de rolagem
        const cards = page.locator('[data-testid^="order-card-"]')
        const visibleCards = await cards.evaluateAll((elements) => {
          const viewportHeight = window.innerHeight
          return elements.filter(el => {
            const rect = el.getBoundingClientRect()
            return rect.top >= 0 && rect.top < viewportHeight
          }).length
        })

        expect(visibleCards).toBeGreaterThanOrEqual(4)
      }
    })
  })

  test.describe('Tipografia Responsiva', () => {
    test('deve manter tipografia legível em mobile (360x640)', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 640 })
      await page.waitForTimeout(500)

      // Pegar primeiro card
      const firstCard = page.locator('[data-testid^="order-card-"]').first()
      if (await firstCard.count() > 0) {
        // Verificar tamanho do título (deve ser >= 18px)
        const titleSize = await firstCard.locator('span').first().evaluate(el => {
          const fontSize = window.getComputedStyle(el).fontSize
          return parseFloat(fontSize)
        })
        expect(titleSize).toBeGreaterThanOrEqual(18)

        // Verificar tamanho do corpo/badge (deve ser >= 14px)
        const bodySize = await firstCard.locator('span[class*="rounded-full"]').first().evaluate(el => {
          const fontSize = window.getComputedStyle(el).fontSize
          return parseFloat(fontSize)
        })
        expect(bodySize).toBeGreaterThanOrEqual(14)
      }
    })
  })

  test.describe('Botão Concluir', () => {
    test('deve ter alvo de toque adequado (>=44px)', async ({ page }) => {
      const completeButton = page.getByTestId('complete-button').first()
      if (await completeButton.count() > 0) {
        const box = await completeButton.boundingBox()
        expect(box?.height).toBeGreaterThanOrEqual(44)
      }
    })

    test('deve mostrar estado de loading ao clicar', async ({ page }) => {
      const completeButton = page.getByTestId('complete-button').first()
      if (await completeButton.count() > 0) {
        await completeButton.click()

        // Verificar que o botão foi desabilitado
        await expect(completeButton).toBeDisabled()

        // Verificar que mostra "Concluindo..."
        await expect(completeButton).toContainText('Concluindo')
      }
    })

    test('deve ser acessível via teclado', async ({ page }) => {
      const completeButton = page.getByTestId('complete-button').first()
      if (await completeButton.count() > 0) {
        await completeButton.focus()
        await expect(completeButton).toBeFocused()

        // Verificar outline visível no foco
        const outline = await completeButton.evaluate(el => {
          return window.getComputedStyle(el).outline
        })
        expect(outline).not.toBe('none')
      }
    })
  })

  test.describe('Pedidos Urgentes', () => {
    test('deve exibir badge "URGENTE" e piscar para pedidos urgentes', async ({ page }) => {
      // Aguardar cards carregarem
      await page.waitForSelector('[data-testid^="order-card-"]', { timeout: 5000 })

      const urgentBadge = page.getByTestId('urgent-badge').first()
      if (await urgentBadge.count() > 0) {
        // Verificar que o badge existe
        await expect(urgentBadge).toBeVisible()
        await expect(urgentBadge).toContainText('URGENTE')

        // Verificar aria-live para acessibilidade
        await expect(urgentBadge).toHaveAttribute('aria-live', 'assertive')

        // Verificar que o card tem animação de pulso
        const card = urgentBadge.locator('..').locator('..')
        const hasUrgentClass = await card.evaluate(el => {
          return el.className.includes('urgent-pulse') || el.className.includes('urgent-glow')
        })
        expect(hasUrgentClass).toBe(true)
      }
    })

    test('deve respeitar prefers-reduced-motion', async ({ page }) => {
      // Simular preferência de movimento reduzido
      await page.emulateMedia({ reducedMotion: 'reduce' })

      const urgentBadge = page.getByTestId('urgent-badge').first()
      if (await urgentBadge.count() > 0) {
        const card = urgentBadge.locator('..').locator('..')

        // Verificar que animação não está rodando
        const animationRunning = await card.evaluate(el => {
          const style = window.getComputedStyle(el)
          return style.animationPlayState === 'running'
        })
        expect(animationRunning).toBe(false)
      }
    })
  })

  test.describe('Scroll Mobile', () => {
    test('deve permitir scroll fluido no mobile', async ({ page, viewport }) => {
      if (viewport?.width && viewport.width <= 640) {
        const board = page.locator('.scrollable-board')

        // Pegar posição inicial de scroll
        const initialScrollTop = await board.evaluate(el => el.scrollTop)

        // Simular scroll
        await board.evaluate(el => el.scrollBy(0, 200))
        await page.waitForTimeout(100)

        // Verificar que o scroll funcionou
        const newScrollTop = await board.evaluate(el => el.scrollTop)
        expect(newScrollTop).toBeGreaterThan(initialScrollTop)
      }
    })

    test('não deve bloquear scroll ao tocar fora dos botões', async ({ page, viewport }) => {
      if (viewport?.width && viewport.width <= 640) {
        const board = page.locator('.scrollable-board')
        const card = page.locator('[data-testid^="order-card-"]').first()

        if (await card.count() > 0) {
          // Tocar no card (não no botão)
          await card.tap()

          // Verificar que o scroll ainda funciona
          const initialScrollTop = await board.evaluate(el => el.scrollTop)
          await board.evaluate(el => el.scrollBy(0, 200))
          await page.waitForTimeout(100)

          const newScrollTop = await board.evaluate(el => el.scrollTop)
          expect(newScrollTop).toBeGreaterThan(initialScrollTop)
        }
      }
    })
  })

  test.describe('Acessibilidade', () => {
    test('deve ter aria-labels adequados', async ({ page }) => {
      // Botões de densidade
      await expect(page.getByTestId('density-compact')).toHaveAttribute('aria-label', 'Densidade compacta')
      await expect(page.getByTestId('density-normal')).toHaveAttribute('aria-label', 'Densidade padrão')
      await expect(page.getByTestId('density-comfortable')).toHaveAttribute('aria-label', 'Densidade confortável')

      // Botão concluir
      const completeButton = page.getByTestId('complete-button').first()
      if (await completeButton.count() > 0) {
        const ariaLabel = await completeButton.getAttribute('aria-label')
        expect(ariaLabel).toMatch(/Concluir pedido/)
      }
    })

    test('deve ter contraste adequado', async ({ page }) => {
      // Verificar contraste do botão URGENTE
      const urgentBadge = page.getByTestId('urgent-badge').first()
      if (await urgentBadge.count() > 0) {
        const colors = await urgentBadge.evaluate(el => {
          const style = window.getComputedStyle(el)
          return {
            color: style.color,
            backgroundColor: style.backgroundColor
          }
        })
        // Badge URGENTE: fundo vermelho escuro (red-600) + texto branco = contraste alto
        expect(colors.backgroundColor).toMatch(/rgb\(220, 38, 38\)/)
        expect(colors.color).toMatch(/rgb\(255, 255, 255\)/)
      }
    })
  })
})
