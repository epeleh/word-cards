import { shallowMount } from '@vue/test-utils';
import CardInfoModal from '@/components/CardInfoModal.vue';

describe('CardInfoModal.vue', () => {
  let wrapper;

  describe('when api responds with 404 status', () => {
    beforeEach(async () => {
      global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 404 }));

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
      expect(global.fetch.mock.calls.length).toBe(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/cards/523');
    });

    it('displays "no-card-banner" with the correct text', () => {
      expect(wrapper.find('h2.no-card-banner').text()).toBe('The card was not found :(');
    });
  });

  describe('when api responds with a card', () => {
    beforeEach(async () => {
      global.fetch = jest.fn(() => Promise.resolve({
        ok: true,
        json: () => ({
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
      expect(global.fetch.mock.calls.length).toBe(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/cards/42');
    });

    it('displays the correct card id', () => {
      expect(wrapper.find('div.card-info.remembered h4').text()).toBe('#42');
      expect(wrapper.find('div.card-info.remembered h4').attributes()).toEqual({ title: '#42' });
    });

    it('displays the correct text and translation', () => {
      expect(wrapper.findAll('div.card-info.remembered > p').map((x) => x.text())).toEqual(
        ['some text', 'some translation'],
      );
    });
  });
});
