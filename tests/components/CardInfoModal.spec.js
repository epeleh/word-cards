import _ from 'lodash';
import { shallowMount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import CardInfoModal from '@/components/CardInfoModal.vue';

describe('CardInfoModal.vue', () => {
  let wrapper;
  afterEach(() => wrapper?.unmount());

  describe('when api responds with 404 status', () => {
    beforeEach(() => {
      global.fetch = jest.fn(async () => ({ ok: false, status: 404 }));

      wrapper = shallowMount(CardInfoModal, {
        global: {
          provide: { backendUrl: '' },
          stubs: ['VisibilityIcon', 'VisibilityOffIcon', 'ClearIcon', 'SaveIcon'],
          mocks: { $windowWidth: 1024 },
        },
        props: {
          cardId: 523,
          closeModal: global.closeModal = jest.fn(),
        },
      });
    });

    it('renders', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('fetches a card by the correct id', () => {
      expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/cards/523');
    });

    it('displays "no-card-banner" with the correct text', () => {
      expect(wrapper.get('h2.no-card-banner').text()).toBe('The card was not found :(');
    });

    describe('when pressing the Escape key', () => {
      it('closes the modal', () => {
        expect(global.closeModal).toHaveBeenCalledTimes(0);

        jest.useFakeTimers();
        _.times(5, () => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' })));
        jest.runAllTimers();

        expect(global.closeModal).toHaveBeenNthCalledWith(1);
      });
    });
  });

  describe('when api responds with a card', () => {
    beforeEach(() => {
      global.fetch = jest.fn(async () => ({
        ok: true,
        json: async () => ({
          id: 42,
          text: 'some text',
          translation: 'some translation',
          image_path: null,
          met_at: '2022-02-12 09:00:13 UTC',
          remembered: true,
          active: true,
          created_at: '2022-02-11 14:58:09 UTC',
          updated_at: '2022-02-12 09:00:13 UTC',
        }),
      }));

      wrapper = shallowMount(CardInfoModal, {
        global: {
          provide: { backendUrl: '' },
          stubs: ['VisibilityIcon', 'VisibilityOffIcon', 'ClearIcon', 'SaveIcon'],
          mocks: { $windowWidth: 1024 },
        },
        props: {
          cardId: 42,
          closeModal: global.closeModal = jest.fn(),
        },
      });
    });

    it('renders', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('fetches a card by the correct id', () => {
      expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/cards/42');
    });

    it('displays the correct card id', () => {
      expect(wrapper.get('div.card-info.remembered h4').text()).toBe('#42');
      expect(wrapper.get('div.card-info.remembered h4').attributes()).toEqual({ title: '#42' });
    });

    it('displays the correct text and translation', () => {
      expect(wrapper.findAll('div.card-info.remembered > p').map((x) => x.text())).toEqual(
        ['some text', 'some translation'],
      );
    });

    describe("when the card doesn't have an image", () => {
      it('allows to upload an image', async () => {
        expect(wrapper.find('img.upload-img').exists()).toBe(false);

        global.fetch = jest.fn(async () => ({
          ok: true,
          json: async () => ({
            id: 42,
            text: 'some text',
            translation: 'some translation',
            image_path: '/storage/card_42.png',
            met_at: '2022-02-12 09:00:13 UTC',
            remembered: true,
            active: true,
            created_at: '2022-02-11 14:58:09 UTC',
            updated_at: '2022-02-12 13:00:08 UTC',
          }),
        }));

        await wrapper.get('input.upload-input').trigger('change');
        await flushPromises();

        const imgSrc = wrapper.get('img.upload-img').attributes('src');
        expect(imgSrc).toBe('/storage/card_42.png?1644670808000');
      });

      it("doesn't allow to delete the image", () => {
        expect(wrapper.find('button.delete-image-btn').exists()).toBe(false);
      });
    });

    describe('when the card has an image', () => {
      beforeEach(async () => {
        global.fetch = jest.fn(async () => ({
          ok: true,
          json: async () => ({
            id: 42,
            text: 'some text',
            translation: 'some translation',
            image_path: '/storage/card_42.jpg',
            met_at: '2022-02-12 09:00:13 UTC',
            remembered: true,
            active: true,
            created_at: '2022-02-11 14:58:09 UTC',
            updated_at: '2022-02-12 11:12:13 UTC',
          }),
        }));

        await wrapper.get('input.upload-input').trigger('change');
        await flushPromises();
      });

      it('allows to upload a new image', async () => {
        const oldImgSrc = wrapper.get('img.upload-img').attributes('src');
        expect(oldImgSrc).toBe('/storage/card_42.jpg?1644664333000');

        global.fetch = jest.fn(async () => ({
          ok: true,
          json: async () => ({
            id: 42,
            text: 'some text',
            translation: 'some translation',
            image_path: '/storage/card_42.jpg',
            met_at: '2022-02-12 09:00:13 UTC',
            remembered: true,
            active: true,
            created_at: '2022-02-11 14:58:09 UTC',
            updated_at: '2022-02-12 15:14:13 UTC',
          }),
        }));

        await wrapper.get('input.upload-input').trigger('change');
        await flushPromises();

        const newImgSrc = wrapper.get('img.upload-img').attributes('src');
        expect(newImgSrc).toBe('/storage/card_42.jpg?1644678853000');
        expect(newImgSrc).not.toBe(oldImgSrc);
      });

      it('allows to delete the image', async () => {
        const oldImgSrc = wrapper.get('img.upload-img').attributes('src');
        expect(oldImgSrc).toBe('/storage/card_42.jpg?1644664333000');
        expect(wrapper.find('button.delete-image-btn').exists()).toBe(true);

        global.fetch = jest.fn(async () => ({
          ok: true,
          json: async () => ({
            id: 42,
            text: 'some text',
            translation: 'some translation',
            image_path: null,
            met_at: '2022-02-12 09:00:13 UTC',
            remembered: true,
            active: true,
            created_at: '2022-02-11 14:58:09 UTC',
            updated_at: '2022-02-12 15:14:13 UTC',
          }),
        }));

        await wrapper.get('button.delete-image-btn').trigger('click');
        await flushPromises();

        expect(wrapper.find('img.upload-img').exists()).toBe(false);
        expect(wrapper.find('button.delete-image-btn').exists()).toBe(false);
      });
    });

    describe('when pressing the Escape key', () => {
      it('closes the modal', () => {
        expect(global.closeModal).toHaveBeenCalledTimes(0);

        jest.useFakeTimers();
        window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' }));
        jest.runAllTimers();

        expect(global.closeModal).toHaveBeenNthCalledWith(1);
      });
    });
  });
});
