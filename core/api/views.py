from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from ..models import EMatch, TournamentStanding
from ..serializers import MatchSerializer, TournamentStandingSerializer
from rest_framework.views import APIView
from django.shortcuts import render
class MatchViewSet(viewsets.ModelViewSet):
    """
    API для работы с матчами
    """
    queryset = EMatch.objects.all()
    serializer_class = MatchSerializer
    pagination_class = None
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'match_date']
    search_fields = ['team_a', 'team_b', 'location']
    ordering_fields = ['match_date', 'match_time', 'created_at']
    ordering = ['match_date', 'match_time']

    def get_queryset(self):
        """Оптимизированный запрос с фильтрацией"""
        queryset = EMatch.objects.all()

        # Фильтрация по статусу через query параметр
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        # Фильтрация по дате
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if date_from:
            queryset = queryset.filter(match_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(match_date__lte=date_to)

        return queryset

    @action(detail=False, methods=['get'])
    def schedule(self, request):
        """
        Получить расписание матчей в формате для React компонента
        """
        matches = self.get_queryset()
        serializer = self.get_serializer(matches, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Получить предстоящие матчи"""
        matches = self.get_queryset().filter(status='upcoming')
        serializer = self.get_serializer(matches, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def live(self, request):
        """Получить матчи в прямом эфире"""
        matches = self.get_queryset().filter(status='live')
        serializer = self.get_serializer(matches, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Получить завершенные матчи"""
        matches = self.get_queryset().filter(status='completed')
        serializer = self.get_serializer(matches, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_score(self, request, pk=None):
        """Обновить счет матча"""
        match = self.get_object()

        if match.status not in ['live', 'completed']:
            return Response(
                {'error': 'Можно обновлять счет только для live или completed матчей'},
                status=status.HTTP_400_BAD_REQUEST
            )

        score_a = request.data.get('scoreA')
        score_b = request.data.get('scoreB')

        if score_a is not None:
            match.score_a = score_a
        if score_b is not None:
            match.score_b = score_b

        match.save()
        serializer = self.get_serializer(match)
        return Response(serializer.data)



class TournamentStandingsAPIView(APIView):
    """
    API для получения турнирной таблицы
    Возвращает данные в формате { groupA: [...], groupB: [...] }
    """

    def get(self, request):
        try:
            # Получаем все записи, отсортированные по группе и позиции
            standings = TournamentStanding.objects.all().order_by('group', 'position')

            # Инициализируем пустые группы
            group_a = []
            group_b = []

            # Разделяем по группам
            for standing in standings:
                serializer = TournamentStandingSerializer(standing)
                if standing.group == 'A':
                    group_a.append(serializer.data)
                elif standing.group == 'B':
                    group_b.append(serializer.data)

            # Формируем ответ
            response_data = {
                "groupA": group_a,
                "groupB": group_b,
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {
                    "error": str(e),
                    "detail": "Failed to fetch tournament standings"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UpdateStandingsAPIView(APIView):
    """
    API для обновления позиций команд
    Требует аутентификации администратора
    """

    def post(self, request):
        # Проверка авторизации (добавьте свою логику)
        if not request.user.is_staff:
            return Response(
                {"error": "Unauthorized"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            data = request.data

            # Валидация входящих данных
            if 'group' not in data or 'standings' not in data:
                return Response(
                    {"error": "Missing 'group' or 'standings' in request data"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            group = data['group']
            standings_data = data['standings']

            if group not in ['A', 'B']:
                return Response(
                    {"error": "Invalid group. Use 'A' or 'B'"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Удаляем старые записи группы
            TournamentStanding.objects.filter(group=group).delete()

            # Создаем новые записи
            for standing in standings_data:
                TournamentStanding.objects.create(
                    position=standing['position'],
                    team_name=standing['name'],
                    group=group,
                    played=standing['played'],
                    won=standing['won'],
                    drawn=standing['drawn'],
                    lost=standing['lost'],
                    goals_for=standing['gf'],
                    goals_against=standing['ga'],
                    form_results=standing['form']
                )

            return Response(
                {"message": f"Group {group} standings updated successfully"},
                status=status.HTTP_200_OK
            )

        except KeyError as e:
            return Response(
                {"error": f"Missing field: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


